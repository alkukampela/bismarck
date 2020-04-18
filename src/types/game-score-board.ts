import { PlayerScore } from './player-score';

export interface GameScoreBoard {
  totalScore: PlayerScore[];
  trickScores: PlayerScore[][];
}
