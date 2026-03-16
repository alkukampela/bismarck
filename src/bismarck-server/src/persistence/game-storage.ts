import { CardContainer } from '../types/card-container';
import { DurableObject } from 'cloudflare:workers';
import { GameState } from '../types/game-state';
import { PlayerScore } from '../../../types/player-score';
import { Trick } from '../types/trick';
import pino from 'pino';
import { GameError } from '../utils/game-error';
import { ErrorTypes } from '../types/error-types';
import { TrickResponse } from '../../../types/trick-response';
import { StateUpdates } from '../types/state-updates';

export class GameStorage extends DurableObject<Env> {
  timeToLiveMs = 86_400_000; // 24 hours

  sql = this.ctx.storage.sql;

  private logger = (() => {
    const log = pino();
    // Increase max listeners to prevent
    // warning in Workers with multiple connections
    if (log.setMaxListeners) {
      log.setMaxListeners(50);
    }
    return log;
  })();

  private readonly TABLES = {
    GAME_STATE: 'game_state',
    CARDS: 'cards',
    TRICK_POINTS: 'trick_points',
    TRICK: 'trick',
  } as const;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.initTable(this.TABLES.GAME_STATE);
    this.initTable(this.TABLES.CARDS);
    this.initTable(this.TABLES.TRICK_POINTS);
    this.initTable(this.TABLES.TRICK);
  }

  async store(entitites: StateUpdates) {
    const statements: string[] = [];

    if (entitites.state) {
      statements.push(
        this.createUpsertStatement(this.TABLES.GAME_STATE, entitites.state)
      );
    }

    if (entitites.deck) {
      statements.push(
        this.createUpsertStatement(this.TABLES.CARDS, entitites.deck)
      );
    }

    if (entitites.trickPoints) {
      statements.push(
        this.createUpsertStatement(
          this.TABLES.TRICK_POINTS,
          entitites.trickPoints
        )
      );
    }

    if (entitites.clearTrick) {
      statements.push(`DELETE FROM ${this.TABLES.TRICK} WHERE id = 1;`);
    } else if (entitites.trick) {
      statements.push(
        this.createUpsertStatement(this.TABLES.TRICK, entitites.trick)
      );
    }

    if (statements.length === 0) {
      this.log('No entities provided to store', 'warn');
      return;
    }

    this.sql.exec(statements.join(''));
    this.log(
      `Successfully stored entities: ${Object.keys(entitites).join(', ')}`
    );
    await this.ctx.storage.setAlarm(Date.now() + this.timeToLiveMs);
  }

  fetchGameData(): {
    gameState?: GameState;
    deck: CardContainer[];
    trickPoints?: PlayerScore[];
    trick?: Trick;
  } {
    const gameState = this.fetchSingleField<GameState>(this.TABLES.GAME_STATE);
    const deck =
      this.fetchSingleField<CardContainer[]>(this.TABLES.CARDS) ?? [];

    const trickPoints = this.fetchSingleField<PlayerScore[]>(
      this.TABLES.TRICK_POINTS
    );

    const trick = this.fetchSingleField<Trick>(this.TABLES.TRICK);

    return { gameState, deck, trickPoints, trick };
  }

  broadcastTrick(trick: TrickResponse) {
    const sockets = this.ctx.getWebSockets();
    this.log(`Broadcasting trick to ${sockets.length} clients`);

    if (sockets.length === 0) {
      this.log('No WebSocket connections to broadcast to', 'warn');
    }

    sockets.forEach((ws) => {
      try {
        ws.send(JSON.stringify(trick));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.log(`Failed to send to WebSocket: ${errorMessage}`, 'error');
      }
    });
  }

  async alarm() {
    this.log('Alarm triggered, clearing storage');
    await this.ctx.storage.deleteAll();
  }

  private handleWebSocket() {
    const connectionId = crypto.randomUUID().substring(0, 5);

    this.log(
      `WebSocket connection requested with id ${connectionId}, total connections: ${
        this.ctx.getWebSockets().length
      }`
    );

    const [client, server] = Object.values(new WebSocketPair());

    this.ctx.acceptWebSocket(server);

    this.log(
      `WebSocket connection accepted with id ${connectionId}, total connections: ${
        this.ctx.getWebSockets().length
      }`
    );

    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketClose(
    _ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ) {
    this.log(
      `WebSocket connection closed with code ${code}, reason: ${reason}, wasClean: ${wasClean}, total connections: ${
        this.ctx.getWebSockets().length
      }`
    );
  }

  fetch() {
    return this.handleWebSocket();
  }

  private initTable = (tableName: string) => {
    const cursor = this.sql.exec(`PRAGMA table_list`);
    if ([...cursor].find((t) => t.name === tableName)) {
      this.log(`${tableName} table already exists`);
      return;
    }
    this.sql.exec(
      `CREATE TABLE IF NOT EXISTS ${tableName} (
        id    INTEGER PRIMARY KEY,
        value TEXT NOT NULL
      )`
    );
    this.log(`Created ${tableName} table`);
  };

  private createUpsertStatement<T>(table: string, data: T): string {
    return `INSERT INTO ${table} (id, value)
      VALUES (1, '${JSON.stringify(data)}')
      ON CONFLICT(id)
      DO UPDATE SET value=excluded.value;`;
  }

  private fetchSingleField<T>(table: string): T | undefined {
    this.log(`Fetching value from table ${table}`);
    const cursor = this.sql.exec(`SELECT value FROM ${table} WHERE id = 1`);
    const result = cursor.toArray()[0];

    if (!result) {
      this.log(`No row found in table ${table}`, 'warn');
      return undefined;
    }

    if (typeof result['value'] !== 'string') {
      this.log(
        `Invalid data format for value in table ${table}: expected string, got ${typeof result[
          'value'
        ]}`,
        'error'
      );
      throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
    }

    return JSON.parse(result['value']) as T;
  }

  private log(
    message: string,
    level: 'info' | 'warn' | 'error' = 'info'
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const logMessage = `[DO: ${this.ctx.id.toString()}] ${message}`;
    switch (level) {
      case 'info':
        this.logger.info(logMessage);
        break;
      case 'warn':
        this.logger.warn(logMessage);
        break;
      case 'error':
        this.logger.error(logMessage);
        break;
    }
  }
}
