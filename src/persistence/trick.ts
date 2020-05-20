import { Suit } from '../types/suit';
import { TrickCard } from '../types/trick-card';

export interface Trick {
  trickSuit: Suit;

  trumpSuit: Suit;

  trickCards: TrickCard[];
}
