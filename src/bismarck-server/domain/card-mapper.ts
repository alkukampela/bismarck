import BiMap from 'bidirectional-map';
import { SuitEnum } from '../../types/suit';
import { Card, Rank, Suit } from '../../types/card';
import { CardsOfDeck } from '../types/cards-of-deck';

const rankMap: Record<Rank, number> = {
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
};

const suitMap: Record<Suit, SuitEnum> = {
  '♦️': SuitEnum.DIAMOND,
  '♣️': SuitEnum.CLUB,
  '♥️': SuitEnum.HEART,
  '♠️': SuitEnum.SPADE,
};

const ranks = new BiMap<Rank, number>(rankMap);
const suits = new BiMap<Suit, SuitEnum>(suitMap);

const getRankFromCardOfDeck = (cardOfDeck: CardsOfDeck): Rank => {
  const rankValue = cardOfDeck % ranks.size;
  return ranks.getKey(rankValue);
};

const getSuitFromCardOfDeck = (cardOfDeck: CardsOfDeck): Suit => {
  const suitValue = Math.trunc(cardOfDeck / ranks.size) + 1;
  return suits.getKey(suitValue);
};

export const fromNumber = (value: CardsOfDeck): Card => {
  return {
    rank: getRankFromCardOfDeck(value),
    suit: getSuitFromCardOfDeck(value),
  };
};

export const getSuit = (card: Card): SuitEnum => {
  return suits.get(card.suit);
};

export const getRank = (card: Card): number => {
  return ranks.get(card.rank);
};
