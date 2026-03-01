import { PlayerScore } from '../../../types/player-score';
import { CardContainer } from './card-container';
import { GameState } from './game-state';
import { Trick } from './trick';

export interface GameDump {
  gameState: GameState;
  cards: CardContainer[];
  playerScores: PlayerScore[];
  trick: Trick;
}
