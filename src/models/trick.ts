import { Card } from './card';

type PlayersCard = [string, Card];

export class Trick {
  private _trumpSuit: number;
  private _trickSuit: number;

  private _cards: PlayersCard[];

  constructor(card: Card, player: string, trumpSuit?: number) {
    this._cards = [];
    this._cards.push([player, card]);
    this._trumpSuit = trumpSuit || card.getSuit();
    this._trickSuit = card.getSuit();
  }

  public playCard(card: Card, player: string) {
    this._cards.push([player, card]);
  }

  public getTaker(): string {
    return this.playerWithTopRankedCardBySuit(this._trumpSuit) || this.playerWithTopRankedCardBySuit(this._trickSuit);
  }

  public playedCards(): number {
    return this._cards.length;
  }

  public getLatestPlayer(): string {
    return this._cards.slice(-1)[0][0];
  }

  presentation(): any {
    return {
      cards: this._cards.map(x => {
        return { player: x[0], card: x[1].presentation() };
      }),
    };
  }

  private playerWithTopRankedCardBySuit(suit: number): string {
    const playersCard = this._cards
      .filter(pc => pc[1].getSuit() === suit)
      .sort((a, b) => b[1].getRank() - a[1].getRank())[0];
    if (!!playersCard) {
      return playersCard[0];
    }
  }
}
