import { getSuit } from './card-mapper';
import { ErrorTypes } from '../types/error-types';
import { calculateTrickPoints } from './game-score-manager';
import { getHandsPoints, updatedTrickScore } from './hand-score-calculator';
import {
  buildHandStatute,
  getStatuteAfterChoice,
} from './hand-statute-machine';
import { Trick } from '../types/trick';
import { Card } from '../../../types/card';
import { Game } from '../../../types/game';
import { GameType } from '../../../types/game-type';
import { GameTypeChoiceRequest } from '../../../types/game-type-choice-request';
import { FullGameType, HandStatute } from '../../../types/hand-statute';
import { Player } from '../../../types/player';
import { PlayerScore } from '../../../types/player-score';
import { PlayersHand } from '../../../types/players-hand';
import { SuitEnum } from '../../../types/suit';
import { TrickResponse } from '../../../types/trick-response';
import {
  getTrumpSuit,
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
  fetchTrick,
  storeTrick,
  fetchScores,
  storeScores,
  fetchGameState,
  storeGameState,
} from '../persistence/storage-service';
import {
  initTrick,
  isTrickReady,
  getTaker,
  hasPlayerTurn,
  playCard,
  emptyTrickResponse,
  convertToTrickResponse,
} from './trick-machine';
import { GameStorage } from '../persistence/game-storage';
import pino from 'pino';

const logger = pino();

const getPlayersIndex = (player: Player, handStatute: HandStatute): number => {
  return handStatute.playerOrder.findIndex((x) => player.name === x.name);
};

const isTrickOpen = async (gameId: string): Promise<boolean> => {
  return fetchTrick(gameId)
    .then((trick) => {
      return !isTrickReady(trick);
    })
    .catch(() => {
      return false;
    });
};

const defaultTrick = async (gameId: string): Promise<TrickResponse> => {
  return fetchGameState(gameId)
    .then((gameState) => {
      return emptyTrickResponse(gameState.handStatute.playerOrder);
    })
    .catch(() => {
      return emptyTrickResponse([]);
    });
};

const getTrickLead = async (
  gameId: string,
  handStatute: HandStatute
): Promise<Player> => {
  return fetchTrick(gameId)
    .then((trick) => {
      return getTaker(trick);
    })
    .catch(() => {
      return handStatute.eldestHand;
    });
};

const isEldestHand = (player: Player, handStatute: HandStatute): boolean => {
  return player.name === handStatute.eldestHand.name;
};

const checkCardsLegality = async (
  playerIndex: number,
  card: Card,
  trick: Trick,
  gameId: string
): Promise<boolean> => {
  if (getSuit(card) === trick.trickSuit) {
    return true;
  }

  const playersCards = await getPlayersCards(
    playerIndex,
    trick.trickCards.length,
    gameId
  );

  if (playerHasCardsOfSuit(trick.trickSuit, playersCards)) {
    return false;
  }

  if (getSuit(card) === trick.trumpSuit) {
    return true;
  }

  if (playerHasCardsOfSuit(trick.trumpSuit, playersCards)) {
    return false;
  }

  return true;
};

const playerHasCardsOfSuit = (
  trickSuit: SuitEnum,
  playersCards: Card[]
): boolean => {
  return playersCards.some((card) => getSuit(card) === trickSuit);
};

export const setUpHand = async (
  gameId: string,
  game: Game
): Promise<HandStatute> => {
  initDeck(gameId);

  const handStatute = buildHandStatute(game, await getTrumpSuit(gameId));

  storeScores(
    handStatute.playerOrder.map((player) => {
      return { player, score: 0 } as PlayerScore;
    }),
    gameId
  );

  return handStatute;
};

export const getPlayersHand = async (
  player: Player,
  gameId: string
): Promise<PlayersHand> => {
  const gameState = await fetchGameState(gameId);
  if (
    !gameState ||
    (gameState.handStatute.isChoice && !gameState.handStatute.gameType)
  ) {
    return { cards: [], extraCards: 0 };
  }
  const cards = await getPlayersCards(
    getPlayersIndex(player, gameState.handStatute),
    gameState.players.length,
    gameId
  );
  return {
    cards,
    extraCards: extraCardsAmount(cards.length, gameState.players.length),
  };
};

export const removePlayersCard = async (
  player: Player,
  card: Card,
  gameId: string
): Promise<Card> => {
  const gameState = await fetchGameState(gameId);

  if (!isEldestHand(player, gameState.handStatute)) {
    return Promise.reject(Error(ErrorTypes.MUST_BE_ELDEST_HAND));
  }

  if (!gameState.handStatute.gameType?.value) {
    return Promise.reject(new Error(ErrorTypes.GAME_TYPE_NOT_CHOSEN));
  }
  const playerIndex = getPlayersIndex(player, gameState.handStatute);

  const hasPlayerGivenCard = await hasPlayerCard(
    playerIndex,
    gameState.players.length,
    card,
    gameId
  );
  if (!hasPlayerGivenCard) {
    return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
  }

  const tooManyCards = await hasTooManyCards(
    playerIndex,
    gameState.players.length,
    gameId
  );
  if (!tooManyCards) {
    return Promise.reject(Error(ErrorTypes.NO_MORE_CARDS_TO_REMOVE));
  }

  removeCard(card, gameId);
  return card;
};

export const getStatute = async (
  stub: DurableObjectStub<GameStorage>
): Promise<HandStatute> => {
  const gameState = await stub.fetchGameState();
  logger.info(`Game state found: ${!!gameState}`);
  if (!gameState) {
    return Promise.reject(new Error(ErrorTypes.NOT_FOUND));
  }
  return gameState.handStatute;
};

export const getTableCards = async (
  stub: DurableObjectStub<GameStorage>
): Promise<Card[]> => {
  return getTableCardsFromStorage(stub);
};

export const chooseGameType = async (
  player: Player,
  gameTypeChoice: GameTypeChoiceRequest,
  stub: DurableObjectStub<GameStorage>
): Promise<HandStatute> => {
  const gameState = await stub.fetchGameState();
  if (!gameState) {
    return Promise.reject(new Error(ErrorTypes.NOT_FOUND));
  }

  if (!isEldestHand(player, gameState.handStatute)) {
    return Promise.reject(new Error(ErrorTypes.MUST_BE_ELDEST_HAND));
  }

  if (gameState.handStatute.gameType) {
    return Promise.reject(new Error(ErrorTypes.GAME_TYPE_CHOSEN));
  }

  const validatedChoice: FullGameType =
    gameTypeChoice.gameType === GameType.TRUMP
      ? !gameTypeChoice.trumpSuit
        ? (() => {
            throw new Error(ErrorTypes.ILLEGAL_CHOICE);
          })()
        : {
            value: GameType.TRUMP,
            trumpSuit: gameTypeChoice.trumpSuit,
          }
      : { value: gameTypeChoice.gameType };

  const chosenStatute = getStatuteAfterChoice(
    gameState.handStatute,
    validatedChoice
  );

  const updatedGameState = {
    ...gameState,
    handStatute: chosenStatute,
  };
  stub.storeGameState(updatedGameState);
  return chosenStatute;
};

export const getCurrentTrick = async (
  gameId: string
): Promise<TrickResponse> => {
  return fetchTrick(gameId)
    .then((trick) => {
      return convertToTrickResponse(trick);
    })
    .catch(async () => {
      return defaultTrick(gameId);
    });
};

export const startTrick = async (
  player: Player,
  card: Card,
  gameId: string
): Promise<TrickResponse> => {
  const isOpen = await isTrickOpen(gameId);
  if (isOpen) {
    return Promise.reject(new Error(ErrorTypes.TRICK_ALREADY_STARTED));
  }

  const gameState = await fetchGameState(gameId);
  const playerIndex = getPlayersIndex(player, gameState.handStatute);

  if (!gameState.handStatute.gameType?.value) {
    return Promise.reject(new Error(ErrorTypes.GAME_TYPE_NOT_CHOSEN));
  }

  const trickLead = await getTrickLead(gameId, gameState.handStatute);
  if (player.name !== trickLead.name) {
    return Promise.reject(new Error(ErrorTypes.NOT_TRICK_LEAD));
  }

  const hasPlayerGivenCard = await hasPlayerCard(
    playerIndex,
    gameState.players.length,
    card,
    gameId
  );
  if (!hasPlayerGivenCard) {
    return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
  }

  const tooManyCards = await hasTooManyCards(
    playerIndex,
    gameState.players.length,
    gameId
  );
  if (tooManyCards) {
    return Promise.reject(Error(ErrorTypes.CARDS_MUST_BE_REMOVED));
  }

  const trickNumber = await roundNumber(
    playerIndex,
    gameState.players.length,
    gameId
  );
  const trick = initTrick(card, player, gameState.handStatute, trickNumber);

  removeCard(card, gameId);
  storeTrick(trick, gameId);

  return Promise.resolve(convertToTrickResponse(trick));
};

export const addCardToTrick = async (
  player: Player,
  card: Card,
  gameId: string
): Promise<TrickResponse> => {
  const isOpen = await isTrickOpen(gameId);
  if (!isOpen) {
    return Promise.reject(new Error(ErrorTypes.TRICK_NOT_STARTED));
  }

  const trick = await fetchTrick(gameId);
  if (!hasPlayerTurn(trick, player)) {
    return Promise.reject(Error(ErrorTypes.OTHER_PLAYER_HAS_TURN));
  }

  const gameState = await fetchGameState(gameId);
  const playerIndex = getPlayersIndex(player, gameState.handStatute);

  const hasPlayerGivenCard = await hasPlayerCard(
    playerIndex,
    gameState.players.length,
    card,
    gameId
  );
  if (!hasPlayerGivenCard) {
    return Promise.reject(Error(ErrorTypes.CARD_NOT_FOUND));
  }

  const isMoveLegal = await checkCardsLegality(
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
    const playerScoresBefore = await fetchScores(gameId);
    const playerScoresAfter = updatedTrickScore(
      getTaker(updatedTrick),
      playerScoresBefore
    );
    storeScores(playerScoresAfter, gameId);
  }

  const isHandFinished = await isCurrentHandFinished(gameId);

  if (isHandFinished) {
    if (!gameState.handStatute.gameType?.value) {
      // It should not be possible to reach this point without game type.
      throw new Error('Game type is not defined');
    }

    const handTricks = await fetchScores(gameId);
    const handScore = getHandsPoints(
      handTricks,
      gameState.handStatute.gameType.value
    );

    const curremtTrickPoints = calculateTrickPoints(handScore, gameState);
    const updatedState = {
      ...gameState,
      trickScores: [...gameState.trickScores, curremtTrickPoints],
    };

    storeGameState(updatedState, gameId);
  }

  storeTrick(updatedTrick, gameId);

  return convertToTrickResponse(updatedTrick);
};

export const getHandsTrickCounts = async (
  stub: DurableObjectStub<GameStorage>
): Promise<PlayerScore[]> => {
  const trickPoints = await stub.fetchTrickPoints();
  if (!trickPoints) {
    return [];
  }
  return trickPoints;
};

export const isCurrentHandFinished = async (
  gameId: string
): Promise<boolean> => {
  return noCardsLeft(gameId);
};
