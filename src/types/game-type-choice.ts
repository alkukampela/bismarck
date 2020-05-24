import { GameType } from './game-type';
import { Suit } from './suit';

export interface GameTypeChoice {
  gameType: GameType;
  trumpSuit?: Suit;
}
