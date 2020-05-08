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

export class HandEntity {
  private _currentTrick: TrickEntity;

  private _handStatute: HandStatute;

  public async setUp(
    defaulPlayerOrder: Player[],
    handNumber: number,
    gameId: string
  ) {
    const cardManager = new CardManager();
    cardManager.initDeck(gameId);

    this._handStatute = new HandStatuteMachine().getHandStatute(
      defaulPlayerOrder,
      handNumber,
      await cardManager.getTrumpSuit(gameId)
    );

    new HandScore().setUp(this._handStatute.playerOrder, gameId);
  }

  public async getCards(player: Player, gameId: string): Promise<Card[]> {
    return new CardManager().getPlayersCards(
      this.getPlayersIndex(player),
      gameId
    );
  }

  public async removeCard(
    player: Player,
    card: Card,
    gameId: string
  ): Promise<void> {
    if (!this.isEldestHand(player)) {
      return Promise.reject(Error(ErrorTypes.MUST_BE_ELDEST_HAND));
    }

    const playerIndex = this.getPlayersIndex(player);
    const cardManager = new CardManager();

    const hasPlayerCardCard = await cardManager.hasPlayerCard(
      playerIndex,
      card,
      gameId
    );
    if (!hasPlayerCardCard) {
      return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
    }

    const hasTooManyCards = await cardManager.hasTooManyCards(
      playerIndex,
      gameId
    );
    if (!hasTooManyCards) {
      return Promise.reject(Error(ErrorTypes.NO_MORE_CARDS_TO_REMOVE));
    }

    cardManager.removeCard(card, gameId);
    return Promise.resolve();
  }

  public getStatute(): HandStatute {
    return this._handStatute;
  }

  public async getTableCards(gameId: string): Promise<Card[]> {
    return await new CardManager().getTableCards(gameId);
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
    return !!this._currentTrick
      ? this._currentTrick.presentation()
      : this.defaultTrick();
  }

  public async startTrick(
    player: Player,
    card: Card,
    gameId: string
  ): Promise<TrickCards> {
    const playerIndex = this.getPlayersIndex(player);
    const cardManager = new CardManager();

    if (
      this.isTrickOpen() ||
      !this._handStatute.handType.gameType.value ||
      player.name !== this.getTrickLead().name
    ) {
      return Promise.reject(new Error('TODO ADD ERROR'));
    }

    const hasPlayerCardCard = await cardManager.hasPlayerCard(
      playerIndex,
      card,
      gameId
    );
    if (!hasPlayerCardCard) {
      return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
    }

    const hasTooManyCards = await cardManager.hasTooManyCards(
      playerIndex,
      gameId
    );
    if (hasTooManyCards) {
      return Promise.reject(Error(ErrorTypes.CARDS_MUST_BE_REMOVED));
    }

    this._currentTrick = new TrickEntity(card, player, this._handStatute);
    cardManager.removeCard(card, gameId);
    return Promise.resolve(this._currentTrick.presentation());
  }

  public addCardToTrick(
    player: Player,
    card: Card,
    gameId: string
  ): TrickCards {
    if (!this._currentTrick) {
      throw Error(ErrorTypes.TRICK_NOT_STARTED);
    }

    if (!this._currentTrick.hasPlayerTurn(player)) {
      throw Error(ErrorTypes.OTHER_PLAYER_HAS_TURN);
    }

    const playerIndex = this.getPlayersIndex(player);
    const cardManager = new CardManager();

    if (!cardManager.hasPlayerCard(playerIndex, card, gameId)) {
      throw Error(ErrorTypes.CARD_NOT_FOUND);
    }

    if (!this.checkCardsLegality(playerIndex, card, gameId, cardManager)) {
      throw Error(ErrorTypes.MUST_FOLLOW_SUIT_AND_TRUMP);
    }

    this._currentTrick.playCard(card, player);
    cardManager.removeCard(card, gameId);

    if (this._currentTrick.allCardsArePlayed()) {
      new HandScore().takeTrick(this._currentTrick.getTaker(), gameId);
    }

    return this._currentTrick.presentation();
  }

  public async getHandsTrickCounts(gameId: string): Promise<PlayerScore[]> {
    return new HandScore().getTricks(gameId);
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

  private defaultTrick(): TrickCards {
    return {
      cards: this._handStatute.playerOrder.map((player) => {
        return { player };
      }),
    };
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

  private checkCardsLegality(
    playerIndex: number,
    card: Card,
    gameId: string,
    cardManager: CardManager
  ) {
    if (this._currentTrick.isTrickSuit(card)) {
      return true;
    }

    if (
      !this._currentTrick.isTrickSuit(card) &&
      cardManager.hasPlayerCardsOfSuit(
        playerIndex,
        this._currentTrick.getTrickSuit(),
        gameId
      )
    ) {
      return false;
    }

    if (this._currentTrick.isTrumpSuit(card)) {
      return true;
    }

    if (
      !this._currentTrick.isTrumpSuit(card) &&
      cardManager.hasPlayerCardsOfSuit(
        playerIndex,
        this._currentTrick.getTrumpSuit(),
        gameId
      )
    ) {
      return false;
    }

    return true;
  }
}
