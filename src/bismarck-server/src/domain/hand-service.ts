import { getSuit } from './card-mapper';
import { ErrorTypes } from '../types/error-types';
import { calculateTrickPoints } from './game-scoring';
import { getHandsPoints, updatedTrickScore } from './hand-score-calculator';
import {
  buildHandStatute,
  getStatuteAfterChoice,
  toHandStatute,
} from './hand-statute-machine';
import { Trick } from '../types/trick';
import { Card } from '../../../types/card';
import { Game } from '../../../types/game';
import { GameType } from '../../../types/game-type';
import { GameTypeChoiceRequest } from '../../../types/game-type-choice-request';
import { HandStatuteResponse } from '../../../types/hand-statute-response';
import { Player } from '../../../types/player';
import { PlayerScore } from '../../../types/player-score';
import { PlayersHand } from '../../../types/players-hand';
import { SuitEnum } from '../../../types/suit';
import { TrickResponse } from '../../../types/trick-response';
import { TableCardsResponse } from '../../../types/table-cards-respons';
import {
  getTrumpSuit,
  initDeck,
  extraCardsAmount,
  hasTooManyCards,
  getTableCards as tableCardsFromDeck,
  roundNumber,
  getPlayersCards,
  removeCard,
  hasPlayerCard,
  noCardsLeft,
} from './deck-operations';
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
import { GameError } from '../utils/game-error';
import { CardContainer } from '../types/card-container';
import { TABLE_CARDS } from '../types/cards-of-deck';
import { GameTypeData, HandStatuteData } from '../types/game-state';

const logger = pino();

const getPlayersIndex = (player: Player, statute: HandStatuteData): number => {
  return statute.playerOrder.findIndex((x) => player.name === x.name);
};

const defaultTrick = async (
  stub: DurableObjectStub<GameStorage>
): Promise<TrickResponse> => {
  const gameState = await stub.fetchGameState();
  if (!gameState) {
    throw new GameError(ErrorTypes.GAME_NOT_FOUND);
  }
  return emptyTrickResponse(gameState.handStatute.playerOrder);
};

const getLeadPlayerForTrick = (
  trick: Trick | undefined,
  eldestHand: Player
): Player => {
  return trick ? getTaker(trick) : eldestHand;
};

const isEldestHand = (player: Player, statute: HandStatuteData): boolean => {
  return player.name === statute.eldestHand.name;
};

const checkCardsLegality = (
  playerIndex: number,
  card: Card,
  trick: Trick,
  deck: CardContainer[]
): boolean => {
  const cardSuit = getSuit(card);

  // Card matches trick suit - always legal
  if (cardSuit === trick.trickSuit) {
    return true;
  }

  const playersCards = getPlayersCards(
    playerIndex,
    trick.trickCards.length,
    deck
  );

  // Player must follow suit if they have it
  if (playerHasCardsOfSuit(trick.trickSuit, playersCards)) {
    return false;
  }

  // Player must play trump if they have it and can't follow suit
  // Note: for non-trump games trump suit is same as trick suit
  if (cardSuit === trick.trumpSuit) {
    return true;
  }

  if (playerHasCardsOfSuit(trick.trumpSuit, playersCards)) {
    return false;
  }

  // Can play any card if can't follow suit and has no trump
  return true;
};

const playerHasCardsOfSuit = (
  trickSuit: SuitEnum,
  playersCards: Card[]
): boolean => {
  return playersCards.some((card) => getSuit(card) === trickSuit);
};

export const setUpHand = async (
  game: Game,
  stub: DurableObjectStub<GameStorage>
): Promise<HandStatuteData> => {
  const deck = initDeck();
  await stub.storeDeck(deck);

  return buildHandStatute(game, getTrumpSuit(deck));
};

export const getPlayersHand = async (
  player: Player,
  stub: DurableObjectStub<GameStorage>
): Promise<PlayersHand> => {
  const gameState = await stub.fetchGameState();
  if (
    !gameState ||
    (gameState.handStatute.isChoice && !gameState.handStatute.gameType)
  ) {
    return { cards: [], extraCards: 0 };
  }
  const deck = await stub.fetchDeck();
  const cards = getPlayersCards(
    getPlayersIndex(player, gameState.handStatute),
    gameState.players.length,
    deck
  );
  return {
    cards,
    extraCards: extraCardsAmount(cards.length, gameState.players.length),
  };
};

export const removePlayersCard = async (
  player: Player,
  card: Card,
  stub: DurableObjectStub<GameStorage>
): Promise<Card> => {
  const gameState = await stub.fetchGameState();
  if (!gameState) {
    throw new GameError(ErrorTypes.GAME_NOT_FOUND);
  }

  if (!isEldestHand(player, gameState.handStatute)) {
    throw new GameError(ErrorTypes.MUST_BE_ELDEST_HAND);
  }

  if (!gameState.handStatute.gameType?.value) {
    throw new GameError(ErrorTypes.GAME_TYPE_NOT_CHOSEN);
  }
  const playerIndex = getPlayersIndex(player, gameState.handStatute);

  const deck = await stub.fetchDeck();
  if (deck.length === 0) {
    throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
  }

  const hasPlayerGivenCard = hasPlayerCard(
    playerIndex,
    gameState.players.length,
    card,
    deck
  );

  if (!hasPlayerGivenCard) {
    throw new GameError(ErrorTypes.CARD_NOT_FOUND);
  }

  const tooManyCards = hasTooManyCards(
    playerIndex,
    gameState.players.length,
    deck
  );

  if (!tooManyCards) {
    throw new GameError(ErrorTypes.NO_MORE_CARDS_TO_REMOVE);
  }

  const updatedDeck = removeCard(card, deck);
  await stub.storeDeck(updatedDeck);
  return card;
};

export const getStatute = async (
  stub: DurableObjectStub<GameStorage>
): Promise<HandStatuteResponse> => {
  const gameState = await stub.fetchGameState();
  if (!gameState) {
    throw new GameError(ErrorTypes.GAME_NOT_FOUND);
  }
  return toHandStatute(gameState.handStatute);
};

export const getTableCards = async (
  stub: DurableObjectStub<GameStorage>
): Promise<TableCardsResponse> => {
  const deck = await stub.fetchDeck();

  if (
    deck.length === 0 ||
    deck.filter((card) => card.isPlayed).length >= TABLE_CARDS
  ) {
    // Don't return table cards after hand has been started
    return {
      cards: [],
      areCardsOnTheTable: false,
    };
  }

  return {
    cards: tableCardsFromDeck(deck),
    areCardsOnTheTable: true,
  };
};

export const chooseGameType = async (
  player: Player,
  gameTypeChoice: GameTypeChoiceRequest,
  stub: DurableObjectStub<GameStorage>
): Promise<HandStatuteResponse> => {
  const gameState = await stub.fetchGameState();
  if (!gameState) {
    throw new GameError(ErrorTypes.GAME_NOT_FOUND);
  }

  if (!isEldestHand(player, gameState.handStatute)) {
    throw new GameError(ErrorTypes.MUST_BE_ELDEST_HAND);
  }

  if (gameState.handStatute.gameType) {
    throw new GameError(ErrorTypes.GAME_TYPE_CHOSEN);
  }

  let validatedChoice: GameTypeData;

  if (gameTypeChoice.gameType === GameType.TRUMP) {
    if (!gameTypeChoice.trumpSuit) {
      throw new GameError(ErrorTypes.ILLEGAL_CHOICE);
    }
    validatedChoice = {
      value: GameType.TRUMP,
      trumpSuit: gameTypeChoice.trumpSuit,
    };
  } else {
    validatedChoice = { value: gameTypeChoice.gameType, trumpSuit: null };
  }

  const chosenStatute = getStatuteAfterChoice(
    gameState.handStatute,
    validatedChoice
  );

  const updatedGameState = {
    ...gameState,
    handStatute: chosenStatute,
  };
  await stub.storeGameState(updatedGameState);

  await stub.broadcastTrick(
    emptyTrickResponse(gameState.handStatute.playerOrder)
  );
  return toHandStatute(chosenStatute);
};

export const getCurrentTrick = async (
  stub: DurableObjectStub<GameStorage>
): Promise<TrickResponse> => {
  const trick = await stub.fetchTrick();
  return trick ? convertToTrickResponse(trick) : await defaultTrick(stub);
};

export const startTrick = async (
  player: Player,
  card: Card,
  stub: DurableObjectStub<GameStorage>
): Promise<TrickResponse> => {
  const gameState = await stub.fetchGameState();
  if (!gameState) {
    throw new GameError(ErrorTypes.GAME_NOT_FOUND);
  }

  if (!gameState.handStatute.gameType?.value) {
    throw new GameError(ErrorTypes.GAME_TYPE_NOT_CHOSEN);
  }

  const previousTrick = await stub.fetchTrick();
  if (previousTrick && !isTrickReady(previousTrick)) {
    throw new GameError(ErrorTypes.TRICK_ALREADY_STARTED);
  }

  const trickLead = getLeadPlayerForTrick(
    previousTrick,
    gameState.handStatute.eldestHand
  );
  if (player.name !== trickLead.name) {
    throw new GameError(ErrorTypes.NOT_TRICK_LEAD);
  }

  const playerIndex = getPlayersIndex(player, gameState.handStatute);

  const deck = await stub.fetchDeck();
  if (deck.length === 0) {
    throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
  }

  const hasPlayerGivenCard = hasPlayerCard(
    playerIndex,
    gameState.players.length,
    card,
    deck
  );

  if (!hasPlayerGivenCard) {
    throw new GameError(ErrorTypes.CARD_NOT_FOUND);
  }

  const tooManyCards = hasTooManyCards(
    playerIndex,
    gameState.players.length,
    deck
  );

  if (tooManyCards) {
    throw new GameError(ErrorTypes.CARDS_MUST_BE_REMOVED);
  }

  const updatedDeck = removeCard(card, deck);
  await stub.storeDeck(updatedDeck);

  const trickNumber = roundNumber(playerIndex, gameState.players.length, deck);
  const trick = initTrick(card, player, gameState.handStatute, trickNumber);
  await stub.storeTrick(trick);

  const trickResponse = convertToTrickResponse(trick);
  await stub.broadcastTrick(trickResponse);
  return trickResponse;
};

export const addCardToTrick = async (
  player: Player,
  card: Card,
  stub: DurableObjectStub<GameStorage>
): Promise<TrickResponse> => {
  const trick = await stub.fetchTrick();
  if (!trick) {
    throw new GameError(ErrorTypes.TRICK_NOT_FOUND);
  }

  if (trick.trickCards.length === 0) {
    throw new GameError(ErrorTypes.TRICK_NOT_STARTED);
  }

  if (!hasPlayerTurn(trick, player)) {
    throw new GameError(ErrorTypes.OTHER_PLAYER_HAS_TURN);
  }

  const gameState = await stub.fetchGameState();
  if (!gameState) {
    throw new GameError(ErrorTypes.GAME_NOT_FOUND);
  }
  const playerIndex = getPlayersIndex(player, gameState.handStatute);

  const deck = await stub.fetchDeck();
  if (deck.length === 0) {
    throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
  }

  const hasPlayerGivenCard = hasPlayerCard(
    playerIndex,
    gameState.players.length,
    card,
    deck
  );

  if (!hasPlayerGivenCard) {
    throw new GameError(ErrorTypes.CARD_NOT_FOUND);
  }

  const isMoveLegal = checkCardsLegality(playerIndex, card, trick, deck);
  if (!isMoveLegal) {
    throw new GameError(ErrorTypes.MUST_FOLLOW_SUIT_AND_TRUMP);
  }

  const updatedTrick = playCard(trick, player, card);
  const updatedDeck = removeCard(card, deck);
  await stub.storeDeck(updatedDeck);

  if (isTrickReady(updatedTrick)) {
    const playerScoresBefore = await stub.fetchTrickPoints();
    if (!playerScoresBefore) {
      logger.error(
        'Trick points not found when trying to update scores after trick is ready'
      );
      throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
    }
    const playerScoresAfter = updatedTrickScore(
      getTaker(updatedTrick),
      playerScoresBefore
    );
    await stub.storeTrickPoints(playerScoresAfter);

    if (noCardsLeft(updatedDeck)) {
      if (!gameState.handStatute.gameType?.value) {
        // It should not be possible to reach this point without game type.
        throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
      }

      const handScore = getHandsPoints(
        playerScoresAfter,
        gameState.handStatute.gameType.value
      );

      const curremtTrickPoints = calculateTrickPoints(handScore, gameState);
      const updatedState = {
        ...gameState,
        trickScores: [...gameState.trickScores, curremtTrickPoints],
      };

      await stub.storeGameState(updatedState);
    }
  }

  await stub.storeTrick(updatedTrick);

  const trickResponse = convertToTrickResponse(updatedTrick);
  await stub.broadcastTrick(trickResponse);
  return trickResponse;
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
