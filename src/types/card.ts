export const ALL_RANKS = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
] as const;

export const ALL_SUITS = ['♦️', '♣️', '♥️', '♠️'] as const;

export type Rank = typeof ALL_RANKS[number];
export type Suit = typeof ALL_SUITS[number];

export interface Card {
  rank: Rank;
  suit: Suit;
}
