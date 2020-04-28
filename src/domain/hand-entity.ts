import { CardManager } from './card-manager';
import { ErrorTypes } from './error-types';
import { HandScore } from './hand-score';
import { HandStatuteMachine } from './hand-statute-machine';
import { TrickEntity } from './trick-entity';
import { Card } from '../types/card';
import { GameType } from '../types/game-type';
import { HandStatute } from '../types/hand-statute';
import { Player } from '../types/player';
import { PlayerScore } from '../types/player-score';
import { Suit } from '../types/suit';
import { TrickCards } from '../types/trick-cards';
import * as statuses from 'http-status-codes';

export class HandEntity {
  private _cardManager: CardManager;

  private _currentTrick: TrickEntity;

  private _handScore: HandScore;

  private _handStatute: HandStatute;

  constructor(defaulPlayerOrder: Player[], handNumber: number) {
    this._cardManager = new CardManager();

    this._handStatute = new HandStatuteMachine().getHandStatute(
      defaulPlayerOrder,
      handNumber,
      this._cardManager.getTrumpSuit()
    );

    this._handScore = new HandScore(this._handStatute.playerOrder);
  }

  public getCards(player: Player): Card[] {
    return this._cardManager.getPlayersCards(this.getPlayersIndex(player));
  }

  public removeCard(player: Player, card: Card) {
    if (!this.isEldestHand(player)) {
      throw Error(ErrorTypes.MUST_BE_ELDEST_HAND);
    }

    const playerIndex = this.getPlayersIndex(player);

    if (!this._cardManager.hasPlayerCard(playerIndex, card)) {
      throw Error(ErrorTypes.CARD_NOT_FOUND);
    }

    if (!this._cardManager.hasTooManyCards(playerIndex)) {
      throw Error(ErrorTypes.NO_MORE_CARDS_TO_REMOVE);
    }

    this._cardManager.removeCard(card);
  }

  public getStatute(): HandStatute {
    return this._handStatute;
  }

  public getTableCards(): Card[] {
    return this._cardManager.getTableCards();
  }

  public chooseGameType(
    player: Player,
    chosenGameType: GameType,
    suit?: Suit
  ): HandStatute {
    if (!this.isEldestHand(player)) {
      throw Error(ErrorTypes.MUST_BE_ELDEST_HAND);
    }

    if (this._handStatute.handType.gameType.value) {
      throw Error(ErrorTypes.GAME_TYPE_CHOSEN);
    }

    // TODO check that suit is passed if game type is trump and
    // not passed in other game types

    this._handStatute = new HandStatuteMachine().chooseGameType(
      this._handStatute,
      chosenGameType,
      suit
    );
    return this._handStatute;
  }

  public getCurrentTrick(): TrickCards {
    if (!this._currentTrick) {
      throw statuses.NOT_FOUND;
    }

    return this._currentTrick.presentation();
  }

  public startTrick(player: Player, card: Card): TrickCards {
    const playerIndex = this.getPlayersIndex(player);

    if (
      this.isTrickOpen() ||
      !this._handStatute.handType.gameType.value ||
      player.name !== this.getTrickLead().name ||
      this._cardManager.hasTooManyCards(playerIndex) ||
      !this._cardManager.hasPlayerCard(playerIndex, card)
    ) {
      throw statuses.BAD_REQUEST;
    }

    this._currentTrick = new TrickEntity(card, player, this._handStatute);
    this._cardManager.removeCard(card);
    return this._currentTrick.presentation();
  }

  public addCardToTrick(player: Player, card: Card): TrickCards {
    if (!this._currentTrick) {
      throw statuses.BAD_REQUEST;
    }

    if (!this._currentTrick.hasPlayerTurn(player)) {
      throw statuses.FORBIDDEN;
    }
    // TODO: check if card has correct suit

    const playerIndex = this.getPlayersIndex(player);
    if (!this._cardManager.hasPlayerCard(playerIndex, card)) {
      throw statuses.BAD_REQUEST;
    }

    this._currentTrick.playCard(card, player);
    this._cardManager.removeCard(card);

    if (this._currentTrick.allCardsArePlayed()) {
      this._handScore.takeTrick(this._currentTrick.getTaker());
    }

    return this._currentTrick.presentation();
  }

  public getPlayersTrickCount(): PlayerScore[] {
    return this._handScore.getTricks();
  }

  private getPlayersIndex(player: Player): number {
    return this._handStatute.playerOrder.findIndex(
      (x) => player.name === x.name
    );
  }

  private isTrickOpen(): boolean {
    if (!this._currentTrick) {
      return false;
    }

    return !this._currentTrick.allCardsArePlayed();
  }

  private getTrickLead(): Player {
    if (this._currentTrick) {
      return this._currentTrick.getTaker();
    }

    return this._handStatute.eldestHand;
  }

  private isEldestHand(player: Player) {
    return player.name === this._handStatute.eldestHand.name;
  }
}
