import { CardEntity } from './card-entity';
import { Player } from './player';
import { Suit } from './suit';

type PlayersCard = {
  player: Player;
  card: CardEntity;
};

export class TrickEntity {
  private _trumpSuit: Suit;
  private _trickSuit: Suit;

  private _playersCards: PlayersCard[];

  constructor(card: CardEntity, player: Player, trumpSuit?: Suit) {
    this._playersCards = [];
    this._playersCards.push({ player, card });
    this._trumpSuit = trumpSuit || card.getSuit();
    this._trickSuit = card.getSuit();
  }

  public playCard(card: CardEntity, player: Player) {
    this._playersCards.push({ player, card });
  }

  public getTaker(): Player {
    return (
      this.playerWithTopRankedCardBySuit(this._trumpSuit) ||
      this.playerWithTopRankedCardBySuit(this._trickSuit)
    );
  }

  public playedCards(): number {
    return this._playersCards.length;
  }

  public getLatestPlayer(): Player {
    return this._playersCards.slice(-1)[0].player;
  }

  presentation(): any {
    return {
      cards: this._playersCards.map((playersCard) => {
        return {
          [playersCard.player.getName()]: playersCard.card.presentation(),
        };
      }),
    };
  }

  private playerWithTopRankedCardBySuit(suit: Suit): Player {
    const playersCard = this._playersCards
      .filter((pc) => pc.card.getSuit() === suit)
      .sort((a, b) => b.card.getRank() - a.card.getRank())[0];
    if (!!playersCard) {
      return playersCard.player;
    }
  }
}
