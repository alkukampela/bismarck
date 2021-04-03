import { Game } from './game';
import { HandStatute } from './hand-statute';
import { PlayerScore } from './player-score';
import { TrickScore } from './trick-score';
import { CardContainer } from '../persistence/card-container';
import { GamePlayer } from '../persistence/game-player';
import { Trick } from '../persistence/trick';

export interface GameDump {
  game: Game;
  cards: CardContainer[];
  playerScores: PlayerScore[];
  handStatute: HandStatute;
  trick: Trick;
  trickScores: TrickScore[];
  gameLogins: GameLogin[];
}

export interface GameLogin {
  loginId: string;
  gamePlayer: GamePlayer;
}
