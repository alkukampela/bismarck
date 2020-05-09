import { Suit } from './suit';
import { TrickCard } from './trick-cards';

export interface Trick {
  trickSuit: Suit;

  trumpSuit: Suit;

  trickCards: TrickCard[];
}
