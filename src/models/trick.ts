import { Card } from './card';

type PlayersCard = [number, Card];

export class Trick {
  private _trumpSuit: number;
  private _trickSuit: number;

  private _cards: PlayersCard[];

  constructor(card: Card, player: number, trumpSuit?: number) {
    this._cards = [];
    this._cards.push([player, card]);
    this._trumpSuit = trumpSuit || card.getSuit();
    this._trickSuit = card.getSuit();
  }

  public playCard(card: Card, player: number) {
    this._cards.push([player, card]);
  }

  public getSuit(): number {
    return this._trickSuit;
  }

  public getTaker(): number {
    return this.playerWithTopRankedCardBySuit(this._trumpSuit) || this.playerWithTopRankedCardBySuit(this._trickSuit);
  }

  private playerWithTopRankedCardBySuit(suit: number): number {
    const playersCard = this._cards
      .filter(pc => pc[1].getSuit() === suit)
      .sort((a, b) => b[1].getRank() - a[1].getRank())[0];
    if (!!playersCard) {
      return playersCard[0];
    }
  }
}
