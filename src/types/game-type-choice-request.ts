import { GameType } from './game-type';
import { SuitEnum } from './suit';

export interface GameTypeChoiceRequest {
  gameType: GameType;
  trumpSuit?: SuitEnum;
}
