import { GameType } from './game-type';
import { SuitEnum } from './suit';
import { Player } from './player';

export type FullGameType =
  | { value: GameType.TRUMP; trumpSuit: SuitEnum }
  | { value: Exclude<GameType, GameType.TRUMP>; trumpSuit?: undefined };

export interface HandStatuteResponse {
  gameType: FullGameType | undefined;
  isChoice: boolean;
  playerOrder: Player[];
  eldestHand: Player;
  tricksInHand: number;
}
