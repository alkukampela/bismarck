import BiMap from 'bidirectional-map';

export class Card {
  static ranks = new BiMap<number>({
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

  static suits = new BiMap<number>({
    '♦️': 0,
    '♣️': 1,
    '♥️': 2,
    '♠️': 3,
  });

  private _value: number;

  constructor(value: number) {
    this._value = value;
  }

  public printOut() {
    return {
      rank: this.printRank(),
      suit: this.printSuit(),
    };
  }

  public equals(rank: string, suit: string): boolean {
    return this.rankEquals(rank) && this.suitEquals(suit);
  }

  private rankEquals(rank: string): boolean {
    return this.getRank() === Card.ranks.get(rank);
  }

  private suitEquals(suit: string): boolean {
    return this.getSuit() === Card.suits.get(suit);
  }

  private getRank(): number {
    return this._value % 13;
  }

  private getSuit(): number {
    return Math.trunc(this._value / 13);
  }

  private printRank() {
    return Card.ranks.getKey(this.getRank());
  }

  private printSuit(): string {
    return Card.suits.getKey(this.getSuit());
  }
}
