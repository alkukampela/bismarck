import { PlayerScore } from './player-score';

export interface GameStatus {
  scores: PlayerScore[];
  tricks: number;
}
