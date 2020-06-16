import { getSuit } from './card-mapper';
import { ErrorTypes } from './error-types';
import { saveTrickPoints } from './game-score-manager';
import { HandStatuteMachine } from './hand-statute-machine';
import { Trick } from '../persistence/trick';
import { Card } from '../types/card';
import { Game } from '../types/game';
import { GameType } from '../types/game-type';
import { GameTypeChoice } from '../types/game-type-choice';
import { HandStatute } from '../types/hand-statute';
import { Player } from '../types/player';
import { PlayerScore } from '../types/player-score';
import { PlayersHand } from '../types/players-hand';
import { Suit } from '../types/suit';
import { TrickResponse } from '../types/trick-response';
import {
  getTrumpSuit,
  totalRounds,
  initDeck,
  extraCardsAmount,
  hasTooManyCards,
  getTableCards as getTableCardsFromStorage,
  noCardsLeft,
  roundNumber,
  getPlayersCards,
  removeCard,
  hasPlayerCard,
} from './card-manager';
import {
  storeHandStatute,
  fetchHandStatute,
  fetchTrick,
  storeTrick,
} from '../persistence/storage-service';
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

export class HandService {
  public async setUp(gameId: string, game: Game) {
    initDeck(gameId);

    const handStatute = new HandStatuteMachine().getHandStatute(
      game,
      await getTrumpSuit(gameId),
      totalRounds(game.players.length)
    );

    setUpHandScore(handStatute.playerOrder, gameId);
    storeHandStatute(handStatute, gameId);
  }

  public async getPlayersHand(
    player: Player,
    gameId: string
  ): Promise<PlayersHand> {
    const statute = await fetchHandStatute(gameId);
    if (
      !statute ||
      (statute.handType.isChoice && !statute.handType.gameType.value)
    ) {
      return { cards: [], extraCards: 0 };
    }
    const cards = await getPlayersCards(
      this.getPlayersIndex(player, statute),
      statute.playersInGame,
      gameId
    );
    return {
      cards,
      extraCards: extraCardsAmount(cards.length, statute.playersInGame),
    };
  }

  public async removePlayersCard(
    player: Player,
    card: Card,
    gameId: string
  ): Promise<Card> {
    const statute = await fetchHandStatute(gameId);

    if (!this.isEldestHand(player, statute)) {
      return Promise.reject(Error(ErrorTypes.MUST_BE_ELDEST_HAND));
    }

    if (!statute.handType.gameType.value) {
      return Promise.reject(new Error(ErrorTypes.GAME_TYPE_NOT_CHOSEN));
    }
    const playerIndex = this.getPlayersIndex(player, statute);

    const hasPlayerGivenCard = await hasPlayerCard(
      playerIndex,
      statute.playersInGame,
      card,
      gameId
    );
    if (!hasPlayerGivenCard) {
      return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
    }

    const tooManyCards = await hasTooManyCards(
      playerIndex,
      statute.playersInGame,
      gameId
    );
    if (!tooManyCards) {
      return Promise.reject(Error(ErrorTypes.NO_MORE_CARDS_TO_REMOVE));
    }

    removeCard(card, gameId);
    return card;
  }

  public async getStatute(gameId: string): Promise<HandStatute> {
    const statute = await fetchHandStatute(gameId);
    if (!statute) {
      return Promise.reject(new Error(ErrorTypes.NOT_FOUND));
    }
    return statute;
  }

  public async getTableCards(gameId: string): Promise<Card[]> {
    return getTableCardsFromStorage(gameId);
  }

  public async chooseGameType(
    player: Player,
    gameTypeChoice: GameTypeChoice,
    gameId: string
  ): Promise<HandStatute> {
    const statute = await fetchHandStatute(gameId);

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

    storeHandStatute(chosenStatute, gameId);
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
        return this.defaultTrick(gameId);
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

    const statute = await fetchHandStatute(gameId);
    const playerIndex = this.getPlayersIndex(player, statute);

    if (!statute.handType.gameType.value) {
      return Promise.reject(new Error(ErrorTypes.GAME_TYPE_NOT_CHOSEN));
    }

    const trickLead = await this.getTrickLead(gameId, statute);
    if (player.name !== trickLead.name) {
      return Promise.reject(new Error(ErrorTypes.NOT_TRICK_LEAD));
    }

    const hasPlayerGivenCard = await hasPlayerCard(
      playerIndex,
      statute.playersInGame,
      card,
      gameId
    );
    if (!hasPlayerGivenCard) {
      return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
    }

    const tooManyCards = await hasTooManyCards(
      playerIndex,
      statute.playersInGame,
      gameId
    );
    if (tooManyCards) {
      return Promise.reject(Error(ErrorTypes.CARDS_MUST_BE_REMOVED));
    }

    const trickNumber = await roundNumber(
      playerIndex,
      statute.playersInGame,
      gameId
    );
    const trick = initTrick(card, player, statute, trickNumber);

    removeCard(card, gameId);
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

    const statute = await fetchHandStatute(gameId);
    const playerIndex = this.getPlayersIndex(player, statute);

    const hasPlayerGivenCard = await hasPlayerCard(
      playerIndex,
      statute.playersInGame,
      card,
      gameId
    );
    if (!hasPlayerGivenCard) {
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
    await removeCard(card, gameId);

    if (isTrickReady(updatedTrick)) {
      updateTrickTakerToHandScore(getTaker(updatedTrick), gameId);
    }

    const handReady = await noCardsLeft(gameId);

    if (handReady) {
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
    return noCardsLeft(gameId);
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
    return fetchHandStatute(gameId)
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

  private isEldestHand(player: Player, handStatute: HandStatute): boolean {
    return player.name === handStatute.eldestHand.name;
  }

  private async checkCardsLegality(
    playerIndex: number,
    card: Card,
    trick: Trick,
    gameId: string
  ): Promise<boolean> {
    if (getSuit(card) === trick.trickSuit) {
      return true;
    }

    const playersCards = await getPlayersCards(
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
    return fetchTrick(gameId);
  }

  private saveTrick(gameId: string, trick: Trick): void {
    storeTrick(gameId, trick);
  }
}
