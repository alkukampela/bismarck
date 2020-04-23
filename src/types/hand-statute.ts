import { GameType } from './game-type';
import { Suit } from './suit';
import { Player } from './player';

export interface HandStatute {
  handType: HandType;
  playerOrder: Player[];
}

export interface HandType {
  isChoice: boolean;
  gameType?: {
    value: GameType;
    trumpSuit?: Suit;
  };
}
