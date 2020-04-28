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

  private _value: number;

  constructor(value: number) {
    this._value = value;
  }

  public static fromCard(card: Card): CardEntity {
    const suit = CardEntity.suits.get(card.suit);
    const rank = CardEntity.ranks.get(card.rank);
    return new CardEntity(suit.valueOf() * 13 + rank.valueOf());
  }

  public static getSuit(firstCard: Card): Suit {
    return CardEntity.suits.get(firstCard.suit);
  }

  public toCard(): Card {
    return {
      rank: this.printRank(),
      suit: this.printSuit(),
    };
  }

  public getRank(): number {
    return this._value % 13;
  }

  public getSuit(): Suit {
    return Math.trunc(this._value / 13);
  }

  public equals(rank: string, suit: string): boolean {
    return this.rankEquals(rank) && this.suitEquals(suit);
  }

  private rankEquals(rank: string): boolean {
    return this.getRank() === CardEntity.ranks.get(rank);
  }

  private suitEquals(suit: string): boolean {
    return this.getSuit() === CardEntity.suits.get(suit);
  }

  private printRank(): string {
    return CardEntity.ranks.getKey(this.getRank());
  }

  private printSuit(): string {
    return CardEntity.suits.getKey(this.getSuit());
  }
}
