import { PlayerScore } from '../../types/player-score';
import { CardContainer } from './card-container';
import { GamePlayer } from './game-player';
import { GameState } from './game-state';
import { Trick } from './trick';

export interface GameDump {
  gameState: GameState;
  cards: CardContainer[];
  playerScores: PlayerScore[];
  trick: Trick;
  gameLogins: GameLogin[];
}

export interface GameLogin {
  loginId: string;
  gamePlayer: GamePlayer;
}
