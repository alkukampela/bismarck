import { Card } from './card';
import { Player } from './player';
import { Suit } from './suit';

type PlayersCard = [Player, Card];

export class Trick {
  private _trumpSuit: Suit;
  private _trickSuit: Suit;

  private _cards: PlayersCard[];

  constructor(card: Card, player: Player, trumpSuit?: Suit) {
    this._cards = [];
    this._cards.push([player, card]);
    this._trumpSuit = trumpSuit || card.getSuit();
    this._trickSuit = card.getSuit();
  }

  public playCard(card: Card, player: Player) {
    this._cards.push([player, card]);
  }

  public getTaker(): Player {
    return (
      this.playerWithTopRankedCardBySuit(this._trumpSuit) ||
      this.playerWithTopRankedCardBySuit(this._trickSuit)
    );
  }

  public playedCards(): number {
    return this._cards.length;
  }

  public getLatestPlayer(): Player {
    return this._cards.slice(-1)[0][0];
  }

  presentation(): any {
    return {
      cards: this._cards.map((x) => {
        return { [x[0].getName()]: x[1].presentation() };
      }),
    };
  }

  private playerWithTopRankedCardBySuit(suit: Suit): Player {
    const playersCard = this._cards
      .filter((pc) => pc[1].getSuit() === suit)
      .sort((a, b) => b[1].getRank() - a[1].getRank())[0];
    if (!!playersCard) {
      return playersCard[0];
    }
  }
}
