import { CardManager } from './card-manager';
import { ErrorTypes } from './error-types';
import { HandScore } from './hand-score';
import { HandStatuteMachine } from './hand-statute-machine';
import { TrickEntity } from './trick-entity';
import { StorageService } from '../persistence/storage-service';
import { Card } from '../types/card';
import { GameType } from '../types/game-type';
import { HandStatute } from '../types/hand-statute';
import { Player } from '../types/player';
import { PlayerScore } from '../types/player-score';
import { Suit } from '../types/suit';
import { TrickCards } from '../types/trick-cards';

export class HandEntity {
  private _currentTrick: TrickEntity;

  private _storageService: StorageService;
  private _cardManager: CardManager;

  public constructor(storageService: StorageService, cardManager: CardManager) {
    this._storageService = storageService;
    this._cardManager = cardManager;
  }

  public async setUp(
    defaulPlayerOrder: Player[],
    handNumber: number,
    gameId: string
  ) {
    this._cardManager.initDeck(gameId);

    const handStatute = new HandStatuteMachine().getHandStatute(
      defaulPlayerOrder,
      handNumber,
      await this._cardManager.getTrumpSuit(gameId)
    );

    new HandScore().setUp(handStatute.playerOrder, gameId);
    this._storageService.storeHandStatute(gameId, handStatute);
  }

  public async getCards(player: Player, gameId: string): Promise<Card[]> {
    return this._storageService.fetchHandStatute(gameId).then((statute) => {
      return this._cardManager.getPlayersCards(
        this.getPlayersIndex(player, statute),
        gameId
      );
    });
  }

  public async removeCard(
    player: Player,
    card: Card,
    gameId: string
  ): Promise<void> {
    this._storageService.fetchHandStatute(gameId).then(async (statute) => {
      if (!this.isEldestHand(player, statute)) {
        return Promise.reject(Error(ErrorTypes.MUST_BE_ELDEST_HAND));
      }

      const playerIndex = this.getPlayersIndex(player, statute);

      const hasPlayerCardCard = await this._cardManager.hasPlayerCard(
        playerIndex,
        card,
        gameId
      );
      if (!hasPlayerCardCard) {
        return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
      }

      const hasTooManyCards = await this._cardManager.hasTooManyCards(
        playerIndex,
        gameId
      );
      if (!hasTooManyCards) {
        return Promise.reject(Error(ErrorTypes.NO_MORE_CARDS_TO_REMOVE));
      }

      this._cardManager.removeCard(card, gameId);
      return Promise.resolve();
    });
  }

  public async getStatute(gameId: string): Promise<HandStatute> {
    return this._storageService.fetchHandStatute(gameId);
  }

  public async getTableCards(gameId: string): Promise<Card[]> {
    return await this._cardManager.getTableCards(gameId);
  }

  public async chooseGameType(
    player: Player,
    gameId: string,
    chosenGameType: GameType,
    suit?: Suit
  ): Promise<HandStatute> {
    return this._storageService.fetchHandStatute(gameId).then((statute) => {
      if (!this.isEldestHand(player, statute)) {
        throw Error(ErrorTypes.MUST_BE_ELDEST_HAND);
      }

      if (statute.handType.gameType.value) {
        throw Error(ErrorTypes.GAME_TYPE_CHOSEN);
      }

      // TODO check that suit is passed if game type is trump and
      // not passed in other game types

      const chosenStatute = new HandStatuteMachine().chooseGameType(
        statute,
        chosenGameType,
        suit
      );

      this._storageService.storeHandStatute(gameId, chosenStatute);
      return chosenStatute;
    });
  }

  public async getCurrentTrick(gameId: string): Promise<TrickCards> {
    return !!this._currentTrick
      ? this._currentTrick.presentation()
      : this.defaultTrick(gameId);
  }

  public async startTrick(
    player: Player,
    card: Card,
    gameId: string
  ): Promise<TrickCards> {
    return this._storageService
      .fetchHandStatute(gameId)
      .then(async (handStatute) => {
        const playerIndex = this.getPlayersIndex(player, handStatute);

        if (
          this.isTrickOpen() ||
          !handStatute.handType.gameType.value ||
          player.name !== this.getTrickLead(handStatute).name
        ) {
          return Promise.reject(new Error('TODO ADD ERROR'));
        }

        const hasPlayerCardCard = await this._cardManager.hasPlayerCard(
          playerIndex,
          card,
          gameId
        );
        if (!hasPlayerCardCard) {
          return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
        }

        const hasTooManyCards = await this._cardManager.hasTooManyCards(
          playerIndex,
          gameId
        );

        if (hasTooManyCards) {
          return Promise.reject(Error(ErrorTypes.CARDS_MUST_BE_REMOVED));
        }

        this._currentTrick = new TrickEntity(card, player, handStatute);
        this._cardManager.removeCard(card, gameId);
        return Promise.resolve(this._currentTrick.presentation());
      });
  }

  public async addCardToTrick(
    player: Player,
    card: Card,
    gameId: string
  ): Promise<TrickCards> {
    if (!this._currentTrick) {
      throw Error(ErrorTypes.TRICK_NOT_STARTED);
    }

    if (!this._currentTrick.hasPlayerTurn(player)) {
      throw Error(ErrorTypes.OTHER_PLAYER_HAS_TURN);
    }

    return this._storageService.fetchHandStatute(gameId).then((statute) => {
      const playerIndex = this.getPlayersIndex(player, statute);

      if (!this._cardManager.hasPlayerCard(playerIndex, card, gameId)) {
        throw Error(ErrorTypes.CARD_NOT_FOUND);
      }

      if (
        !this.checkCardsLegality(playerIndex, card, gameId, this._cardManager)
      ) {
        throw Error(ErrorTypes.MUST_FOLLOW_SUIT_AND_TRUMP);
      }

      this._currentTrick.playCard(card, player);
      this._cardManager.removeCard(card, gameId);

      if (this._currentTrick.allCardsArePlayed()) {
        new HandScore().takeTrick(this._currentTrick.getTaker(), gameId);
      }

      return this._currentTrick.presentation();
    });
  }

  public async getHandsTrickCounts(gameId: string): Promise<PlayerScore[]> {
    return new HandScore().getTricks(gameId);
  }

  private getPlayersIndex(player: Player, handStatute: HandStatute): number {
    return handStatute.playerOrder.findIndex((x) => player.name === x.name);
  }

  private isTrickOpen(): boolean {
    if (!this._currentTrick) {
      return false;
    }

    return !this._currentTrick.allCardsArePlayed();
  }

  private async defaultTrick(gameId: string): Promise<TrickCards> {
    return this._storageService.fetchHandStatute(gameId).then((statute) => {
      return {
        cards: statute.playerOrder.map((player) => {
          return { player };
        }),
      };
    });
  }

  private getTrickLead(handStatute: HandStatute): Player {
    if (this._currentTrick) {
      return this._currentTrick.getTaker();
    }

    return handStatute.eldestHand;
  }

  private isEldestHand(player: Player, handStatute: HandStatute) {
    return player.name === handStatute.eldestHand.name;
  }

  // TODO Fix this crap
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
