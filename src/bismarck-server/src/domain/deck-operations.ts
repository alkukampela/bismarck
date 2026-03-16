import { fromNumber, getRank, getSuit } from './card-mapper';
import { CardContainer } from '../types/card-container';
import { Card } from '../../../types/card';
import { SuitEnum } from '../../../types/suit';
import { CardsOfDeck, DECK_SIZE, TABLE_CARDS } from '../types/cards-of-deck';
import { shuffle } from '../service/shuffle-service';
import { ErrorTypes } from '../types/error-types';
import { GameError } from '../utils/game-error';

function* sequenceGenerator(maxVal: number): IterableIterator<CardsOfDeck> {
  let currVal = 0;
  while (currVal < maxVal) {
    yield currVal as CardsOfDeck;
    currVal = currVal + 1;
  }
}

const shuffledDeck = (): CardsOfDeck[] => {
  const deck = [...sequenceGenerator(DECK_SIZE)];
  return shuffle(deck);
};

const cardsInHand = (playersInGame: number): number =>
  (DECK_SIZE - TABLE_CARDS) / playersInGame;

const isPlayersCard = (
  player: number,
  playersInGame: number,
  cardIndex: number
): boolean =>
  Math.trunc((cardIndex / cardsInHand(playersInGame)) % playersInGame) ===
  player;

export const tricksInHand = (playersInGame: number): number =>
  (DECK_SIZE - TABLE_CARDS) / playersInGame;

export const getTrumpSuit = (deck: CardContainer[]): SuitEnum => {
  return getSuit(
    deck.slice(-1 * TABLE_CARDS).map((container) => container.card)[0]
  );
};

export const initDeck = (): CardContainer[] => {
  const cards: CardContainer[] = [];
  shuffledDeck()
    .map((value: CardsOfDeck) => {
      return fromNumber(value);
    })
    .forEach((card) => cards.push({ card, isPlayed: false }));
  return cards;
};

export const extraCardsAmount = (
  cards: number,
  playersInGame: number
): number => Math.max(cards - cardsInHand(playersInGame), 0);

export const getTableCardsIfVisible = (
  deck: CardContainer[]
): {
  cards: Card[];
  areCardsOnTheTable: boolean;
} => {
  if (
    deck.length === 0 ||
    deck.filter((container) => container.isPlayed).length >= TABLE_CARDS
  ) {
    return { cards: [], areCardsOnTheTable: false };
  }

  return {
    cards: deck.slice(-1 * TABLE_CARDS).map((container) => container.card),
    areCardsOnTheTable: true,
  };
};

export const noCardsLeft = (deck: CardContainer[]): boolean => {
  return !deck || !deck.some((card) => !card.isPlayed);
};

export const roundNumber = (
  player: number,
  playersInGame: number,
  deck: CardContainer[]
): number => {
  const cardsLeft = deck
    .filter((_val, index) => isPlayersCard(player, playersInGame, index))
    .filter((container) => !container.isPlayed).length;

  return tricksInHand(playersInGame) - cardsLeft;
};

export const getPlayersCards = (
  player: number,
  playersInGame: number,
  deck: CardContainer[]
): Card[] => {
  if (!deck) {
    return [];
  }
  return deck
    .filter((_val, index) => isPlayersCard(player, playersInGame, index))
    .filter((container) => !container.isPlayed)
    .sort((a, b) => getRank(a.card) - getRank(b.card))
    .sort((a, b) => getSuit(a.card) - getSuit(b.card))
    .map((container) => container.card);
};

export const hasPlayerCardOfSuit = (
  suit: SuitEnum,
  player: number,
  playersInGame: number,
  deck: CardContainer[]
): boolean => {
  return getPlayersCards(player, playersInGame, deck).some(
    (card) => getSuit(card) === suit
  );
};

export const hasTooManyCards = (
  player: number,
  playersInGame: number,
  deck: CardContainer[]
): boolean => {
  const cards = getPlayersCards(player, playersInGame, deck);
  return cards.length > cardsInHand(playersInGame);
};

export const removeCard = (
  cardToBeRemoved: Card,
  deck: CardContainer[]
): CardContainer[] => {
  const cardContainer = deck.find(
    (container) =>
      container.card.rank === cardToBeRemoved.rank &&
      container.card.suit === cardToBeRemoved.suit
  );

  if (!cardContainer) {
    throw new GameError(ErrorTypes.CARD_NOT_FOUND);
  }

  if (cardContainer.isPlayed) {
    throw new GameError(ErrorTypes.CARD_ALREADY_PLAYED);
  }

  return deck.map((container) =>
    container.card.rank === cardToBeRemoved.rank &&
    container.card.suit === cardToBeRemoved.suit
      ? { ...container, isPlayed: true }
      : container
  );
};

export const hasPlayerCard = (
  player: number,
  playersInGame: number,
  card: Card,
  deck: CardContainer[]
): boolean => {
  const cards = getPlayersCards(player, playersInGame, deck);
  return cards.some(
    (pc: Card) => pc.rank === card.rank && pc.suit === card.suit
  );
};
