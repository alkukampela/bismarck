import { getSuit } from './card-mapper';
import { ErrorTypes } from '../types/error-types';
import { calculateTrickPoints, getTotalScores } from './game-scoring';
import { getHandsPoints, updatedTrickScore } from './hand-score-calculator';
import {
  buildHandStatute,
  getStatuteAfterChoice,
  toHandStatute,
} from './hand-statute-machine';
import { Trick } from '../types/trick';
import { Card } from '../../../types/card';
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
import { GameState, GameTypeData, HandStatuteData } from '../types/game-state';
import { GameScoreBoard } from '../../../types/game-score-board';
import { ServiceResult } from '../types/service-result';

const logger = pino();

const getPlayersIndex = (player: Player, statute: HandStatuteData): number => {
  return statute.playerOrder.findIndex((x) => player.name === x.name);
};

const buildDefaultTrick = (gameState: GameState): TrickResponse => {
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

export const getPlayersHand = (
  player: Player,
  gameState: GameState | undefined,
  deck: CardContainer[]
): ServiceResult<PlayersHand> => {
  if (
    !gameState ||
    (gameState.handStatute.isChoice && !gameState.handStatute.gameType)
  ) {
    return {
      updates: {},
      retval: { cards: [], extraCards: 0 },
    };
  }
  const cards = getPlayersCards(
    getPlayersIndex(player, gameState.handStatute),
    gameState.players.length,
    deck
  );
  return {
    updates: {},
    retval: {
      cards,
      extraCards: extraCardsAmount(cards.length, gameState.players.length),
    },
  };
};

export const removePlayersCard = (
  player: Player,
  card: Card,
  gameState: GameState | undefined,
  deck: CardContainer[]
): ServiceResult<Card> => {
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

  return {
    updates: {
      deck: updatedDeck,
    },
    retval: card,
  };
};

export const getStatute = (
  gameState: GameState | undefined
): ServiceResult<HandStatuteResponse> => {
  if (!gameState) {
    throw new GameError(ErrorTypes.GAME_NOT_FOUND);
  }
  return {
    updates: {},
    retval: toHandStatute(gameState.handStatute),
  };
};

export const getTableCards = (
  deck: CardContainer[]
): ServiceResult<TableCardsResponse> => {
  if (
    deck.length === 0 ||
    deck.filter((card) => card.isPlayed).length >= TABLE_CARDS
  ) {
    // Don't return table cards after hand has been started
    return {
      updates: {},
      retval: {
        cards: [],
        areCardsOnTheTable: false,
      },
    };
  }

  return {
    updates: {},
    retval: {
      cards: tableCardsFromDeck(deck),
      areCardsOnTheTable: true,
    },
  };
};

export const chooseGameType = (
  player: Player,
  gameTypeChoice: GameTypeChoiceRequest,
  gameState: GameState | undefined
): ServiceResult<HandStatuteResponse> => {
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

  return {
    updates: {
      state: updatedGameState,
    },
    retval: toHandStatute(chosenStatute),
    broadcastValue: emptyTrickResponse(gameState.handStatute.playerOrder),
  };
};

export const getCurrentTrick = (
  trick: Trick | undefined,
  gameState: GameState | undefined
): ServiceResult<TrickResponse> => {
  if (!gameState) {
    throw new GameError(ErrorTypes.GAME_NOT_FOUND);
  }

  const trickResponse = trick
    ? convertToTrickResponse(trick)
    : buildDefaultTrick(gameState);

  return {
    updates: {},
    retval: trickResponse,
  };
};

export const startTrick = (
  player: Player,
  card: Card,
  gameState: GameState | undefined,
  previousTrick: Trick | undefined,
  deck: CardContainer[]
): ServiceResult<TrickResponse> => {
  if (!gameState) {
    throw new GameError(ErrorTypes.GAME_NOT_FOUND);
  }

  if (!gameState.handStatute.gameType?.value) {
    throw new GameError(ErrorTypes.GAME_TYPE_NOT_CHOSEN);
  }

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

  const trickNumber = roundNumber(playerIndex, gameState.players.length, deck);
  const trick = initTrick(card, player, gameState.handStatute, trickNumber);

  const trickResponse = convertToTrickResponse(trick);

  return {
    updates: {
      trick,
      deck: updatedDeck,
    },
    retval: trickResponse,
    broadcastValue: trickResponse,
  };
};

export const addCardToTrick = (
  player: Player,
  card: Card,
  gameState: GameState | undefined,
  trick: Trick | undefined,
  deck: CardContainer[],
  playerScoresBefore: PlayerScore[] | undefined
): ServiceResult<TrickResponse> => {
  if (!trick) {
    throw new GameError(ErrorTypes.TRICK_NOT_FOUND);
  }

  if (trick.trickCards.length === 0) {
    throw new GameError(ErrorTypes.TRICK_NOT_STARTED);
  }

  if (!hasPlayerTurn(trick, player)) {
    throw new GameError(ErrorTypes.OTHER_PLAYER_HAS_TURN);
  }

  if (!gameState) {
    throw new GameError(ErrorTypes.GAME_NOT_FOUND);
  }
  const playerIndex = getPlayersIndex(player, gameState.handStatute);

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
  let playerScoresAfter: PlayerScore[] | undefined;
  let updatedState: GameState | undefined;

  if (isTrickReady(updatedTrick)) {
    if (!playerScoresBefore) {
      logger.error(
        'Trick points not found when trying to update scores after trick is ready'
      );
      throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
    }
    playerScoresAfter = updatedTrickScore(
      getTaker(updatedTrick),
      playerScoresBefore
    );

    if (noCardsLeft(updatedDeck)) {
      if (!gameState.handStatute.gameType?.value) {
        // It should not be possible to reach this point without game type.
        throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
      }

      const handScore = getHandsPoints(
        playerScoresAfter,
        gameState.handStatute.gameType.value
      );

      const currentTrickPoints = calculateTrickPoints(handScore, gameState);
      updatedState = {
        ...gameState,
        trickScores: [...gameState.trickScores, currentTrickPoints],
      };
    }
  }

  const trickResponse = convertToTrickResponse(updatedTrick);
  
  return {
    updates: {
      trickPoints: playerScoresAfter,
      state: updatedState,
      deck: updatedDeck,
      trick: updatedTrick,
    },
    retval: trickResponse,
    broadcastValue: trickResponse,
  };
};

export const getHandsTrickCounts = (
  trickPoints: PlayerScore[] | undefined
): ServiceResult<PlayerScore[]> => {
  return {
    updates: {},
    retval: trickPoints ?? [],
  };
};

export const initHand = (
  gameState: GameState | undefined,
  currentDeck: CardContainer[]
): ServiceResult<HandStatuteResponse> => {
  const isHandFinished = noCardsLeft(currentDeck);

  if (!isHandFinished) {
    throw new GameError(ErrorTypes.CURRENT_HAND_NOT_FINISHED);
  }

  if (!gameState) {
    throw new GameError(ErrorTypes.GAME_NOT_FOUND);
  }

  if (gameState.handNumber >= gameState.players.length * 4) {
    throw new GameError(ErrorTypes.GAME_ENDED);
  }

  const newDeck = initDeck();
  const statute = buildHandStatute(gameState, getTrumpSuit(newDeck));

  const updatedGameState = {
    ...gameState,
    handNumber: gameState.handNumber + 1,
    handStatute: statute,
  };

  const trickPoints = statute.playerOrder.map((player) => {
    return { player, score: 0 };
  });

  return {
    updates: {
      state: updatedGameState,
      trickPoints,
      deck: newDeck,
      clearTrick: true,
    },
    retval: toHandStatute(statute),
    broadcastValue: emptyTrickResponse(updatedGameState.players),
  };
};

export const getGameScores = (
  gameState: GameState | undefined
): ServiceResult<GameScoreBoard> => {
  if (!gameState) {
    throw new GameError(ErrorTypes.GAME_NOT_FOUND);
  }
  return {
    updates: {},
    retval: getTotalScores(gameState),
  };
};
