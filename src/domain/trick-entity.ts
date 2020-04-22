import { CardEntity } from './card-entity';
import { Player } from './player';
import { Suit } from '../types/suit';
import { TrickCards } from '../types/trick-cards';

type PlayersCard = {
  player: Player;
  card?: CardEntity;
};

export class TrickEntity {
  private _trumpSuit: Suit;
  private _trickSuit: Suit;

  private _playersCards: PlayersCard[];

  constructor(card: CardEntity, players: Player[], trumpSuit?: Suit) {
    this._playersCards = players.map((player, index) => {
      return index === 0 ? { player, card } : { player };
    });

    this._trumpSuit = trumpSuit || card.getSuit();
    this._trickSuit = card.getSuit();
  }

  public playCard(card: CardEntity, player: Player) {
    this._playersCards.filter((pc) => pc.player.equals(player))[0].card = card;
  }

  public getTaker(): Player {
    return (
      this.playerWithTopRankedCardBySuit(this._trumpSuit) ||
      this.playerWithTopRankedCardBySuit(this._trickSuit)
    );
  }

  public playedCards(): number {
    return this._playersCards.filter((pc) => !!pc.card).length;
  }

  public getLatestPlayer(): Player {
    return this._playersCards.filter((pc) => !!pc.card).slice(-1)[0].player;
  }

  presentation(): TrickCards {
    return {
      cards: this._playersCards.map((playersCard) => {
        return !!playersCard.card
          ? {
              player: playersCard.player.getName(),
              card: playersCard.card.toCard(),
            }
          : {
              player: playersCard.player.getName(),
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
