import { CardEntity } from './card-entity';
import { Card } from '../types/card';
import { HandStatute } from '../types/hand-statute';
import { Player } from '../types/player';
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

  constructor(firstCard: Card, trickLead: Player, handStatute: HandStatute) {
    this._playersCards = this.tricksPlayerOrder(
      trickLead,
      handStatute.playerOrder
    );

    this.playCard(firstCard, trickLead);

    this._trumpSuit =
      handStatute.handType.gameType.trumpSuit || CardEntity.getSuit(firstCard);
    this._trickSuit = CardEntity.getSuit(firstCard);
  }

  public playCard(card: Card, player: Player) {
    this._playersCards.filter(
      (pc) => pc.player.name === player.name
    )[0].card = CardEntity.fromCard(card);
  }

  public getTaker(): Player {
    return (
      this.playerWithTopRankedCardBySuit(this._trumpSuit) ||
      this.playerWithTopRankedCardBySuit(this._trickSuit)
    );
  }

  public allCardsArePlayed(): boolean {
    return !this._playersCards.filter((pc) => !pc.card).length;
  }

  public hasPlayerTurn(player: Player): boolean {
    const nextPlayer = this.nextPlayerInTurn();
    return !!nextPlayer && player.name === nextPlayer.name;
  }

  public presentation(): TrickCards {
    return {
      cards: this._playersCards.map((playersCard) => {
        return !!playersCard.card
          ? {
              player: playersCard.player,
              card: playersCard.card.toCard(),
            }
          : {
              player: playersCard.player,
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

  private tricksPlayerOrder(
    trickLead: Player,
    defaultOrder: Player[]
  ): PlayersCard[] {
    const startingIndex = defaultOrder.findIndex(
      (player) => player.name === trickLead.name
    );
    return [
      ...defaultOrder.slice(startingIndex),
      ...defaultOrder.slice(0, startingIndex),
    ].map((player) => {
      return { player };
    });
  }

  private nextPlayerInTurn(): Player {
    const nextPlayer = this._playersCards.find((pc) => !pc.card);
    return nextPlayer && nextPlayer.player;
  }
}
