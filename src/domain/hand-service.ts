import { getSuit } from './card-mapper';
import { ErrorTypes } from './error-types';
import { saveTrickPoints } from './game-score-manager';
import { getHandStatute, getStatuteAfterChoice } from './hand-statute-machine';
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
  trickSuit: Suit,
  playersCards: Card[]
): boolean => {
  return playersCards.some((card) => getSuit(card) === trickSuit);
};

export const setUpHand = async (gameId: string, game: Game) => {
  initDeck(gameId);

  const handStatute = getHandStatute(game, await getTrumpSuit(gameId));

  setUpHandScore(handStatute.playerOrder, gameId);
  storeHandStatute(handStatute, gameId);
};

export const getPlayersHand = async (
  player: Player,
  gameId: string
): Promise<PlayersHand> => {
  const statute = await fetchHandStatute(gameId);
  if (
    !statute ||
    (statute.handType.isChoice && !statute.handType.gameType.value)
  ) {
    return { cards: [], extraCards: 0 };
  }
  const cards = await getPlayersCards(
    getPlayersIndex(player, statute),
    statute.playersInGame,
    gameId
  );
  return {
    cards,
    extraCards: extraCardsAmount(cards.length, statute.playersInGame),
  };
};

export const removePlayersCard = async (
  player: Player,
  card: Card,
  gameId: string
): Promise<Card> => {
  const statute = await fetchHandStatute(gameId);

  if (!isEldestHand(player, statute)) {
    return Promise.reject(Error(ErrorTypes.MUST_BE_ELDEST_HAND));
  }

  if (!statute.handType.gameType.value) {
    return Promise.reject(new Error(ErrorTypes.GAME_TYPE_NOT_CHOSEN));
  }
  const playerIndex = getPlayersIndex(player, statute);

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
};

export const getStatute = async (gameId: string): Promise<HandStatute> => {
  const statute = await fetchHandStatute(gameId);
  if (!statute) {
    return Promise.reject(new Error(ErrorTypes.NOT_FOUND));
  }
  return statute;
};

export const getTableCards = async (gameId: string): Promise<Card[]> => {
  return getTableCardsFromStorage(gameId);
};

export const chooseGameType = async (
  player: Player,
  gameTypeChoice: GameTypeChoice,
  gameId: string
): Promise<HandStatute> => {
  const statute = await fetchHandStatute(gameId);

  if (!isEldestHand(player, statute)) {
    return Promise.reject(new Error(ErrorTypes.MUST_BE_ELDEST_HAND));
  }

  if (!!statute.handType.gameType) {
    return Promise.reject(new Error(ErrorTypes.GAME_TYPE_CHOSEN));
  }

  if (
    (gameTypeChoice.gameType === GameType.TRUMP && !gameTypeChoice.trumpSuit) ||
    (gameTypeChoice.gameType !== GameType.TRUMP && !!gameTypeChoice.trumpSuit)
  ) {
    return Promise.reject(new Error(ErrorTypes.ILLEGAL_CHOICE));
  }

  const chosenStatute = getStatuteAfterChoice(statute, gameTypeChoice);

  storeHandStatute(chosenStatute, gameId);
  return chosenStatute;
};

export const getCurrentTrick = async (
  gameId: string
): Promise<TrickResponse> => {
  return fetchTrick(gameId)
    .then((trick) => {
      return {
        cards: trick.trickCards,
        taker: isTrickReady(trick) && getTaker(trick),
        trickNumber: trick.trickNumber,
      };
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

  const statute = await fetchHandStatute(gameId);
  const playerIndex = getPlayersIndex(player, statute);

  if (!statute.handType.gameType.value) {
    return Promise.reject(new Error(ErrorTypes.GAME_TYPE_NOT_CHOSEN));
  }

  const trickLead = await getTrickLead(gameId, statute);
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
  storeTrick(gameId, trick);

  return Promise.resolve({
    cards: trick.trickCards,
    trickNumber: trick.trickNumber,
  });
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

  const statute = await fetchHandStatute(gameId);
  const playerIndex = getPlayersIndex(player, statute);

  const hasPlayerGivenCard = await hasPlayerCard(
    playerIndex,
    statute.playersInGame,
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

  storeTrick(gameId, updatedTrick);

  return {
    cards: updatedTrick.trickCards,
    taker: isTrickReady(updatedTrick) && getTaker(updatedTrick),
    trickNumber: updatedTrick.trickNumber,
  };
};

export const getHandsTrickCounts = async (
  gameId: string
): Promise<PlayerScore[]> => {
  const scores = await getHandScoresTricks(gameId);
  if (!scores) {
    return [];
  }
  return scores;
};

export const isCurrentHandFinished = async (
  gameId: string
): Promise<boolean> => {
  return noCardsLeft(gameId);
};
