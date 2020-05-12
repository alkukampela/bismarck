import BiMap from 'bidirectional-map';
import { Suit } from '../types/suit';
import { Card } from '../types/card';

export class CardEntity {
  static readonly ranks = new BiMap<number>({
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

  static readonly suits = new BiMap<Suit>({
    '♦️': Suit.DIAMOND,
    '♣️': Suit.CLUB,
    '♥️': Suit.HEART,
    '♠️': Suit.SPADE,
  });

  public static fromNumber(value: number): Card {
    return {
      rank: CardEntity.ranks.getKey(CardEntity.rankFrom(value)),
      suit: CardEntity.suits.getKey(CardEntity.suitFrom(value)),
    };
  }

  public static getSuit(card: Card): Suit {
    return CardEntity.suits.get(card.suit);
  }

  public static getRank(card: Card): number {
    return CardEntity.ranks.get(card.rank);
  }

  private static rankFrom(value: number): number {
    return value % 13;
  }

  private static suitFrom(value: number): Suit {
    return Math.trunc(value / 13) + 1;
  }
}
