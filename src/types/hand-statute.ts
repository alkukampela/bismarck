import { GameType } from './game-type';
import { Suit } from './suit';

export interface HandStatute {
  handType: HandType;
  playerOrder: string[];
}

export interface HandType {
  isChoice: boolean;
  gameType?: {
    value: GameType;
    trumpSuit?: Suit;
  };
}
