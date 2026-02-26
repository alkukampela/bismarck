import { GameType } from './game-type';
import { SuitEnum } from './suit';
import { Player } from './player';

export type FullGameType =
  | { value: GameType.TRUMP; trumpSuit: SuitEnum }
  | { value: Exclude<GameType, GameType.TRUMP>; trumpSuit?: undefined };

export interface HandStatute {
  gameType: FullGameType | undefined;
  isChoice: boolean;
  playerOrder: Player[];
  eldestHand: Player;
  playersInGame: number;
  tricksInHand: number;
}
