import { Game } from '../../types/game';
import { HandStatute } from '../../types/hand-statute';
import { PlayerScore } from '../../types/player-score';
import { TrickScore } from '../../types/trick-score';
import { CardContainer } from './card-container';
import { GamePlayer } from './game-player';
import { Trick } from './trick';

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
