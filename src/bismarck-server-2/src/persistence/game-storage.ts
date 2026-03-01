import { DurableObject } from 'cloudflare:workers';
import { GameState } from '../types/game-state';
import pino from 'pino';

const logger = pino();

export class GameStorage extends DurableObject<Env> {
  sql = this.ctx.storage.sql;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    const cursor = this.sql.exec(`PRAGMA table_list`);

    if ([...cursor].find((t) => t.name === 'game_state')) {
      logger.info('Table already exists');
      return;
    }

    this.sql.exec(`
			  CREATE TABLE IF NOT EXISTS game_state (
          id      INTEGER PRIMARY KEY,
			    state   TEXT NOT NULL
			  )
			`);
    logger.info('Created game_state table');
  }

  storeGameState(state: GameState) {
    this.sql.exec(
      `INSERT INTO game_state (id, state)
       VALUES (1, ?)
       ON CONFLICT(id)
       DO UPDATE SET state=excluded.state;`,
      JSON.stringify(state)
    );
    logger.info('Stored game state');
  }

  fetchGameState(): GameState | undefined {
    const cursor = this.sql.exec(`SELECT state FROM game_state WHERE id = 1`);

    let result = cursor.toArray()[0];

    if (!result || typeof result.state !== 'string') {
      logger.warn('No game state found');
      return undefined;
    }

    return JSON.parse(result.state) as GameState;
  }
}
