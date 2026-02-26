import { PlayerScore } from '../../types/player-score';
import { TrickScore } from '../../types/trick-score';
import { CardContainer } from './card-container';
import { GamePlayer } from './game-player';
import { GameState } from './game-state';
import { Trick } from './trick';

export interface GameDump {
  gameState: GameState;
  cards: CardContainer[];
  playerScores: PlayerScore[];
  trick: Trick;
  trickScores: TrickScore[];
  gameLogins: GameLogin[];
}

export interface GameLogin {
  loginId: string;
  gamePlayer: GamePlayer;
}
