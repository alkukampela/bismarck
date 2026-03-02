import { CardContainer } from '../types/card-container';
import { DurableObject } from 'cloudflare:workers';
import { GameState } from '../types/game-state';
import { PlayerScore } from '../../../types/player-score';
import { Trick } from '../types/trick';
import pino from 'pino';
import { GameError } from '../utils/game-error';
import { ErrorTypes } from '../types/error-types';

const logger = pino();

export class GameStorage extends DurableObject<Env> {
  sql = this.ctx.storage.sql;

  static readonly TABLES = {
    GAME_STATE: 'game_state',
    CARDS: 'cards',
    TRICK_POINTS: 'trick_points',
    TRICK: 'trick',
  } as const;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.initTable(
      GameStorage.TABLES.GAME_STATE,
      `CREATE TABLE IF NOT EXISTS ${GameStorage.TABLES.GAME_STATE} (
          id      INTEGER PRIMARY KEY,
          state   TEXT NOT NULL
        )`
    );
    this.initTable(
      GameStorage.TABLES.CARDS,
      `CREATE TABLE IF NOT EXISTS ${GameStorage.TABLES.CARDS} (
          id    INTEGER PRIMARY KEY,
          cards TEXT NOT NULL
        )`
    );
    this.initTable(
      GameStorage.TABLES.TRICK_POINTS,
      `CREATE TABLE IF NOT EXISTS ${GameStorage.TABLES.TRICK_POINTS} (
          id    INTEGER PRIMARY KEY,
          points TEXT NOT NULL
        )`
    );
    this.initTable(
      GameStorage.TABLES.TRICK,
      `CREATE TABLE IF NOT EXISTS ${GameStorage.TABLES.TRICK} (
          id    INTEGER PRIMARY KEY,
          trick TEXT NOT NULL
        )`
    );
  }

  storeGameState(state: GameState) {
    this.upsertSingleField(GameStorage.TABLES.GAME_STATE, 'state', state);
  }

  fetchGameState(): GameState | undefined {
    return this.fetchSingleField<GameState>(
      GameStorage.TABLES.GAME_STATE,
      'state'
    );
  }

  storeDeck(cards: CardContainer[]) {
    this.upsertSingleField(GameStorage.TABLES.CARDS, 'cards', cards);
  }

  fetchDeck(): CardContainer[] {
    return (
      this.fetchSingleField<CardContainer[]>(
        GameStorage.TABLES.CARDS,
        'cards'
      ) ?? []
    );
  }

  storeTrickPoints(points: PlayerScore[]) {
    this.upsertSingleField(GameStorage.TABLES.TRICK_POINTS, 'points', points);
  }

  fetchTrickPoints(): PlayerScore[] | undefined {
    return this.fetchSingleField<PlayerScore[]>(
      GameStorage.TABLES.TRICK_POINTS,
      'points'
    );
  }

  storeTrick(trick: Trick) {
    this.upsertSingleField(GameStorage.TABLES.TRICK, 'trick', trick);
  }

  fetchTrick(): Trick | undefined {
    return this.fetchSingleField<Trick>(GameStorage.TABLES.TRICK, 'trick');
  }

  private initTable = (tableName: string, createTableSql: string) => {
    const cursor = this.sql.exec(`PRAGMA table_list`);
    if ([...cursor].find((t) => t.name === tableName)) {
      this.log(`${tableName} table already exists`);
      return;
    }
    this.sql.exec(createTableSql);
    this.log(`Created ${tableName} table`);
  };

  private fetchSingleField<T>(table: string, field: string): T | undefined {
    this.log(`Fetching ${field} from table ${table}`);
    const cursor = this.sql.exec(`SELECT ${field} FROM ${table} WHERE id = 1`);
    const result = cursor.toArray()[0];

    if (!result) {
      this.log(`No row found in table ${table}`, 'warn');
      return undefined;
    }

    if (typeof result[field] !== 'string') {
      this.log(
        `Invalid data format for ${field} in table ${table}: expected string, got ${typeof result[
          field
        ]}`,
        'error'
      );
      throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
    }

    return JSON.parse(result[field]) as T;
  }

  private upsertSingleField<T>(table: string, field: string, data: T): void {
    this.log(`Upserting ${field} in ${table}`);
    const result = this.sql.exec(
      `INSERT INTO ${table} (id, ${field})
       VALUES (1, ?)
       ON CONFLICT(id)
       DO UPDATE SET ${field}=excluded.${field};`,
      JSON.stringify(data)
    );

    if (result.rowsWritten !== 1) {
      this.log(`Expected to affect 1 row in ${table}.${field}`, 'error');
      throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
    }
    this.log(`Successfully upserted ${field} in ${table}`);
  }

  private log(
    message: string,
    level: 'info' | 'warn' | 'error' = 'info'
  ): void {
    const logMessage = `[DO: ${this.ctx.id.toString()}] ${message}`;
    switch (level) {
      case 'info':
        logger.info(logMessage);
        break;
      case 'warn':
        logger.warn(logMessage);
        break;
      case 'error':
        logger.error(logMessage);
        break;
    }
  }
}
