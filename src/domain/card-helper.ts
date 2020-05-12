import BiMap from 'bidirectional-map';
import { Suit } from '../types/suit';
import { Card } from '../types/card';

const ranks = new BiMap<number>({
  '2': 0,
  '3': 1,
  '4': 2,
  '5': 3,
  '6': 4,
  '7': 5,
  '8': 6,
  '9': 7,
  '10': 8,
  J: 9,
  Q: 10,
  K: 11,
  A: 12,
});

const suits = new BiMap<Suit>({
  '♦️': Suit.DIAMOND,
  '♣️': Suit.CLUB,
  '♥️': Suit.HEART,
  '♠️': Suit.SPADE,
});

const rankFrom = (value: number): number => {
  return value % 13;
};

const suitFrom = (value: number): Suit => {
  return Math.trunc(value / 13) + 1;
};

export const fromNumber = (value: number): Card => {
  return {
    rank: ranks.getKey(rankFrom(value)),
    suit: suits.getKey(suitFrom(value)),
  };
};

export const getSuit = (card: Card): Suit => {
  return suits.get(card.suit);
};

export const getRank = (card: Card): number => {
  return ranks.get(card.rank);
};
