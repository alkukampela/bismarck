import { GameType } from './game-type';
import { SuitEnum } from './suit';
import { Player } from './player';

export type FullGameType =
  | { value: GameType.TRUMP; trumpSuit: SuitEnum }
  | { value: Exclude<GameType, GameType.TRUMP>; trumpSuit?: undefined };

export interface HandStatute {
  handType: HandType;
  playerOrder: Player[];
  eldestHand: Player;
  playersInGame: number;
  tricksInHand: number;
}

export interface HandType {
  isChoice: boolean;
  gameType?: FullGameType;
}
