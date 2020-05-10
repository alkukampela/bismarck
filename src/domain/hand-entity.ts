import { CardManager } from './card-manager';
import { ErrorTypes } from './error-types';
import { HandScore } from './hand-score';
import { HandStatuteMachine } from './hand-statute-machine';
import { StorageService } from '../persistence/storage-service';
import { Card } from '../types/card';
import { GameType } from '../types/game-type';
import { HandStatute } from '../types/hand-statute';
import { Player } from '../types/player';
import { PlayerScore } from '../types/player-score';
import { Suit } from '../types/suit';
import { Trick } from '../types/trick';
import { TrickCards } from '../types/trick-cards';
import {
  initTrick,
  allCardsArePlayed,
  getTaker,
  hasPlayerTurn,
  playCard,
} from './trick-machine';
import { Game } from '../types/game';

export class HandEntity {
  private _storageService: StorageService;
  private _cardManager: CardManager;

  public constructor(storageService: StorageService, cardManager: CardManager) {
    this._storageService = storageService;
    this._cardManager = cardManager;
  }

  public async setUp(gameId: string, game: Game) {
    this._cardManager.initDeck(gameId);

    const handStatute = new HandStatuteMachine().getHandStatute(
      game,
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
  ): Promise<Card> {
    const statute = await this._storageService.fetchHandStatute(gameId);

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
    return card;
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
    const statute = await this._storageService.fetchHandStatute(gameId);

    if (!this.isEldestHand(player, statute)) {
      return Promise.reject(Error(ErrorTypes.MUST_BE_ELDEST_HAND));
    }

    if (statute.handType.gameType.value) {
      return Promise.reject(Error(ErrorTypes.GAME_TYPE_CHOSEN));
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
  }

  public async getCurrentTrick(gameId: string): Promise<TrickCards> {
    return this.getTrick(gameId)
      .then((trick) => {
        return { cards: trick.trickCards };
      })
      .catch(async () => {
        const trick = await this.defaultTrick(gameId);
        return trick;
      });
  }

  public async startTrick(
    player: Player,
    card: Card,
    gameId: string
  ): Promise<TrickCards> {
    const isOpen = await this.isTrickOpen(gameId);
    if (isOpen) {
      return Promise.reject(new Error(ErrorTypes.TRICK_ALREADY_STARTED));
    }

    const statute = await this._storageService.fetchHandStatute(gameId);
    const playerIndex = this.getPlayersIndex(player, statute);

    if (!statute.handType.gameType.value) {
      return Promise.reject(new Error(ErrorTypes.GAME_TYPE_NOT_CHOSEN));
    }

    const trickLead = await this.getTrickLead(gameId, statute);
    if (player.name !== trickLead.name) {
      return Promise.reject(new Error(ErrorTypes.NOT_TRICK_LEAD));
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

    const trick = initTrick(card, player, statute);

    this._cardManager.removeCard(card, gameId);
    this.saveTrick(gameId, trick);

    return Promise.resolve({
      cards: trick.trickCards,
    });
  }

  public async addCardToTrick(
    player: Player,
    card: Card,
    gameId: string
  ): Promise<TrickCards> {
    const isOpen = await this.isTrickOpen(gameId);
    if (!isOpen) {
      return Promise.reject(new Error(ErrorTypes.TRICK_NOT_STARTED));
    }

    const trick = await this.getTrick(gameId);
    if (!hasPlayerTurn(trick, player)) {
      return Promise.reject(Error(ErrorTypes.OTHER_PLAYER_HAS_TURN));
    }

    const statute = await this._storageService.fetchHandStatute(gameId);
    const playerIndex = this.getPlayersIndex(player, statute);

    if (!this._cardManager.hasPlayerCard(playerIndex, card, gameId)) {
      return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
    }

    if (
      !this.checkCardsLegality(playerIndex, card, gameId, this._cardManager)
    ) {
      return Promise.reject(Error(ErrorTypes.MUST_FOLLOW_SUIT_AND_TRUMP));
    }

    const updatedTrick = playCard(trick, player, card);
    this._cardManager.removeCard(card, gameId);

    if (allCardsArePlayed(updatedTrick)) {
      new HandScore().takeTrick(getTaker(updatedTrick), gameId);
    }

    this.saveTrick(gameId, updatedTrick);
    return {
      cards: updatedTrick.trickCards,
    };
  }

  public async getHandsTrickCounts(gameId: string): Promise<PlayerScore[]> {
    return new HandScore().getTricks(gameId);
  }

  private getPlayersIndex(player: Player, handStatute: HandStatute): number {
    return handStatute.playerOrder.findIndex((x) => player.name === x.name);
  }

  private async isTrickOpen(gameId: string): Promise<boolean> {
    return this.getTrick(gameId)
      .then((trick) => {
        return !allCardsArePlayed(trick);
      })
      .catch(() => {
        return false;
      });
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

  private async getTrickLead(
    gameId: string,
    handStatute: HandStatute
  ): Promise<Player> {
    return this.getTrick(gameId)
      .then((trick) => {
        return getTaker(trick);
      })
      .catch(() => {
        return handStatute.eldestHand;
      });
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
    /*
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
    }*/

    return true;
  }

  private async getTrick(gameId: string): Promise<Trick> {
    return this._storageService.fetchTrick(gameId);
  }

  private saveTrick(gameId: string, trick: Trick) {
    this._storageService.storeTrick(gameId, trick);
  }
}
