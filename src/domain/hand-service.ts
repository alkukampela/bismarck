import { CardManager } from './card-manager';
import { getSuit } from './card-mapper';
import { ErrorTypes } from './error-types';
import { saveTrickPoints } from './game-score-manager';
import { HandStatuteMachine } from './hand-statute-machine';
import { Trick } from '../persistence/trick';
import { StorageService } from '../persistence/storage-service';
import { Card } from '../types/card';
import { Game } from '../types/game';
import { GameType } from '../types/game-type';
import { HandStatute } from '../types/hand-statute';
import { Player } from '../types/player';
import { PlayerScore } from '../types/player-score';
import { PlayersHand } from '../types/players-hand';
import { Suit } from '../types/suit';
import { TrickResponse } from '../types/trick-response';
import {
  initTrick,
  isTrickReady,
  getTaker,
  hasPlayerTurn,
  playCard,
} from './trick-machine';
import {
  getHandScoresTricks,
  updateTrickTakerToHandScore,
  setUpHandScore,
  getHandsPoints,
} from './hand-score';
import { GameTypeChoice } from '../types/game-type-choice';

export class HandService {
  private readonly _storageService: StorageService;
  private readonly _cardManager: CardManager;

  public constructor(storageService: StorageService, cardManager: CardManager) {
    this._storageService = storageService;
    this._cardManager = cardManager;
  }

  public async setUp(gameId: string, game: Game) {
    this._cardManager.initDeck(gameId);

    const handStatute = new HandStatuteMachine().getHandStatute(
      game,
      await this._cardManager.getTrumpSuit(gameId),
      this._cardManager.totalRounds(game.players.length)
    );

    setUpHandScore(handStatute.playerOrder, gameId);
    this._storageService.storeHandStatute(handStatute, gameId);
  }

  public async getPlayersHand(
    player: Player,
    gameId: string
  ): Promise<PlayersHand> {
    const statute = await this._storageService.fetchHandStatute(gameId);
    if (
      !statute ||
      (statute.handType.isChoice && !statute.handType.gameType.value)
    ) {
      return { cards: [], extraCards: 0 };
    }
    const cards = await this._cardManager.getPlayersCards(
      this.getPlayersIndex(player, statute),
      statute.playersInGame,
      gameId
    );
    return {
      cards,
      extraCards: this._cardManager.extraCardsAmount(
        cards.length,
        statute.playersInGame
      ),
    };
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

    if (!statute.handType.gameType.value) {
      return Promise.reject(new Error(ErrorTypes.GAME_TYPE_NOT_CHOSEN));
    }
    const playerIndex = this.getPlayersIndex(player, statute);

    const hasPlayerCardCard = await this._cardManager.hasPlayerCard(
      playerIndex,
      statute.playersInGame,
      card,
      gameId
    );
    if (!hasPlayerCardCard) {
      return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
    }

    const hasTooManyCards = await this._cardManager.hasTooManyCards(
      playerIndex,
      statute.playersInGame,
      gameId
    );
    if (!hasTooManyCards) {
      return Promise.reject(Error(ErrorTypes.NO_MORE_CARDS_TO_REMOVE));
    }

    this._cardManager.removeCard(card, gameId);
    return card;
  }

  public async getStatute(gameId: string): Promise<HandStatute> {
    const statute = await this._storageService.fetchHandStatute(gameId);
    if (!statute) {
      return Promise.reject(new Error(ErrorTypes.NOT_FOUND));
    }
    return statute;
  }

  public async getTableCards(gameId: string): Promise<Card[]> {
    return this._cardManager.getTableCards(gameId);
  }

  public async chooseGameType(
    player: Player,
    gameTypeChoice: GameTypeChoice,
    gameId: string
  ): Promise<HandStatute> {
    const statute = await this._storageService.fetchHandStatute(gameId);

    if (!this.isEldestHand(player, statute)) {
      return Promise.reject(new Error(ErrorTypes.MUST_BE_ELDEST_HAND));
    }

    if (!!statute.handType.gameType) {
      return Promise.reject(new Error(ErrorTypes.GAME_TYPE_CHOSEN));
    }

    if (
      (gameTypeChoice.gameType === GameType.TRUMP &&
        !gameTypeChoice.trumpSuit) ||
      (gameTypeChoice.gameType !== GameType.TRUMP && !!gameTypeChoice.trumpSuit)
    ) {
      return Promise.reject(new Error(ErrorTypes.ILLEGAL_CHOICE));
    }

    const chosenStatute = new HandStatuteMachine().chooseGameType(
      statute,
      gameTypeChoice
    );

    this._storageService.storeHandStatute(chosenStatute, gameId);
    return chosenStatute;
  }

  public async getCurrentTrick(gameId: string): Promise<TrickResponse> {
    return this.getTrick(gameId)
      .then((trick) => {
        return {
          cards: trick.trickCards,
          taker: isTrickReady(trick) && getTaker(trick),
          trickNumber: trick.trickNumber,
        };
      })
      .catch(async () => {
        return await this.defaultTrick(gameId);
      });
  }

  public async startTrick(
    player: Player,
    card: Card,
    gameId: string
  ): Promise<TrickResponse> {
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
      statute.playersInGame,
      card,
      gameId
    );
    if (!hasPlayerCardCard) {
      return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
    }

    const hasTooManyCards = await this._cardManager.hasTooManyCards(
      playerIndex,
      statute.playersInGame,
      gameId
    );
    if (hasTooManyCards) {
      return Promise.reject(Error(ErrorTypes.CARDS_MUST_BE_REMOVED));
    }

    const trickNumber = await this._cardManager.roundNumber(
      playerIndex,
      statute.playersInGame,
      gameId
    );
    const trick = initTrick(card, player, statute, trickNumber);

    this._cardManager.removeCard(card, gameId);
    this.saveTrick(gameId, trick);

    return Promise.resolve({
      cards: trick.trickCards,
      trickNumber: trick.trickNumber,
    });
  }

  public async addCardToTrick(
    player: Player,
    card: Card,
    gameId: string
  ): Promise<TrickResponse> {
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

    const hasPlayerCard = await this._cardManager.hasPlayerCard(
      playerIndex,
      statute.playersInGame,
      card,
      gameId
    );
    if (!hasPlayerCard) {
      return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
    }

    const isMoveLegal = await this.checkCardsLegality(
      playerIndex,
      card,
      trick,
      gameId
    );
    if (!isMoveLegal) {
      return Promise.reject(Error(ErrorTypes.MUST_FOLLOW_SUIT_AND_TRUMP));
    }

    const updatedTrick = playCard(trick, player, card);
    await this._cardManager.removeCard(card, gameId);

    if (isTrickReady(updatedTrick)) {
      updateTrickTakerToHandScore(getTaker(updatedTrick), gameId);
      console.log('trick ready');
    }

    const handReady = await this._cardManager.noCardsLeft(gameId);

    if (handReady) {
      console.log('hand ready');
      const trickScores = await getHandScoresTricks(gameId);
      const handScore = getHandsPoints(
        trickScores,
        statute.handType.gameType.value
      );
      saveTrickPoints(handScore, statute, gameId);
    }

    this.saveTrick(gameId, updatedTrick);

    return {
      cards: updatedTrick.trickCards,
      taker: isTrickReady(updatedTrick) && getTaker(updatedTrick),
      trickNumber: updatedTrick.trickNumber,
    };
  }

  public async getHandsTrickCounts(gameId: string): Promise<PlayerScore[]> {
    const scores = await getHandScoresTricks(gameId);
    if (!scores) {
      return [];
    }
    return scores;
  }

  public async isHandFinished(gameId: string): Promise<boolean> {
    return await this._cardManager.noCardsLeft(gameId);
  }

  private getPlayersIndex(player: Player, handStatute: HandStatute): number {
    return handStatute.playerOrder.findIndex((x) => player.name === x.name);
  }

  private async isTrickOpen(gameId: string): Promise<boolean> {
    return this.getTrick(gameId)
      .then((trick) => {
        return !isTrickReady(trick);
      })
      .catch(() => {
        return false;
      });
  }

  private async defaultTrick(gameId: string): Promise<TrickResponse> {
    return this._storageService
      .fetchHandStatute(gameId)
      .then((statute) => {
        return {
          cards: statute.playerOrder.map((player) => {
            return { player };
          }),
        };
      })
      .catch(() => {
        return { cards: [] };
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

  private async checkCardsLegality(
    playerIndex: number,
    card: Card,
    trick: Trick,
    gameId: string
  ) {
    if (getSuit(card) === trick.trickSuit) {
      return true;
    }

    const playersCards = await this._cardManager.getPlayersCards(
      playerIndex,
      trick.trickCards.length,
      gameId
    );

    if (this.playerHasCardsOfSuit(trick.trickSuit, playersCards)) {
      return false;
    }

    if (getSuit(card) === trick.trumpSuit) {
      return true;
    }

    if (this.playerHasCardsOfSuit(trick.trumpSuit, playersCards)) {
      return false;
    }

    return true;
  }

  private playerHasCardsOfSuit(trickSuit: Suit, playersCards: Card[]): boolean {
    return (
      playersCards.filter((card) => getSuit(card) === trickSuit).length > 0
    );
  }

  private async getTrick(gameId: string): Promise<Trick> {
    return this._storageService.fetchTrick(gameId);
  }

  private saveTrick(gameId: string, trick: Trick) {
    this._storageService.storeTrick(gameId, trick);
  }
}
