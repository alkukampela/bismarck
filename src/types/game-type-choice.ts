import { GameType } from './game-type';
import { SuitEnum } from './suit';

export interface GameTypeChoice {
  gameType: GameType;
  trumpSuit?: SuitEnum;
}
