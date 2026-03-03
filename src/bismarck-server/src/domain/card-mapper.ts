import { SuitEnum } from '../../../types/suit';
import { Card, Rank, Suit } from '../../../types/card';
import { CardsOfDeck } from '../types/cards-of-deck';

const rankMappings: { key: Rank; value: number }[] = [
  { key: '2', value: 0 },
  { key: '3', value: 1 },
  { key: '4', value: 2 },
  { key: '5', value: 3 },
  { key: '6', value: 4 },
  { key: '7', value: 5 },
  { key: '8', value: 6 },
  { key: '9', value: 7 },
  { key: '10', value: 8 },
  { key: 'J', value: 9 },
  { key: 'Q', value: 10 },
  { key: 'K', value: 11 },
  { key: 'A', value: 12 },
];

const suitMappings: { key: Suit; value: SuitEnum }[] = [
  { key: '♦️', value: SuitEnum.DIAMOND },
  { key: '♣️', value: SuitEnum.CLUB },
  { key: '♥️', value: SuitEnum.HEART },
  { key: '♠️', value: SuitEnum.SPADE },
];

const getRankFromCardOfDeck = (cardOfDeck: CardsOfDeck): Rank => {
  const rankValue = cardOfDeck % rankMappings.length;
  return rankMappings[rankValue].key;
};

const getSuitFromCardOfDeck = (cardOfDeck: CardsOfDeck): Suit => {
  const suitValue = Math.trunc(cardOfDeck / rankMappings.length);
  return suitMappings[suitValue].key;
};

export const fromNumber = (value: CardsOfDeck): Card => {
  return {
    rank: getRankFromCardOfDeck(value),
    suit: getSuitFromCardOfDeck(value),
  };
};

export const getSuit = (card: Card): SuitEnum => {
  // All suits are mapped.
  return suitMappings.find((m) => m.key === card.suit)!.value;
};

export const getRank = (card: Card): number => {
  // All ranks are mapped.
  return rankMappings.find((m) => m.key === card.rank)!.value;
};
