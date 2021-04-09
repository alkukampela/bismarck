import { fromNumber, getRank, getSuit } from './card-mapper';
import { CardContainer } from '../persistence/card-container';
import { fetchCards, storeCards } from '../persistence/storage-service';
import { Card } from '../types/card';
import { Suit } from '../types/suit';
import shuffle from 'fisher-yates';

const TABLE_CARDS = 4;
const DECK_SIZE = 52;

function* sequenceGenerator(maxVal: number): IterableIterator<number> {
  let currVal = 0;
  while (currVal < maxVal) {
    yield currVal;
    currVal = currVal + 1;
  }
}

const shuffledDeck = (): number[] => {
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

export const getTrumpSuit = async (gameId: string): Promise<Suit> => {
  const cards = await fetchCards(gameId);
  return getSuit(
    cards.slice(-1 * TABLE_CARDS).map((container) => container.card)[0]
  );
};

export const initDeck = (gameId: string): void => {
  const cards: CardContainer[] = [];
  shuffledDeck()
    .map((value: number) => {
      return fromNumber(value);
    })
    .forEach((card) => cards.push({ card, isPlayed: false }));
  storeCards(cards, gameId);
};

export const extraCardsAmount = (
  cards: number,
  playersInGame: number
): number => Math.max(cards - cardsInHand(playersInGame), 0);

export const getTableCards = async (gameId: string): Promise<Card[]> => {
  const cards = await fetchCards(gameId);
  if (!cards) {
    return [];
  }
  return cards.slice(-1 * TABLE_CARDS).map((container) => container.card);
};

export const noCardsLeft = async (gameId: string): Promise<boolean> => {
  const cards = await fetchCards(gameId);
  return !cards || !cards.some((card) => !card.isPlayed);
};

export const roundNumber = async (
  player: number,
  playersInGame: number,
  gameId: string
): Promise<number> => {
  const cards = await fetchCards(gameId);
  const cardsLeft = cards
    .filter((_val, index) => isPlayersCard(player, playersInGame, index))
    .filter((container) => !container.isPlayed).length;

  return tricksInHand(playersInGame) - cardsLeft;
};

export const getPlayersCards = async (
  player: number,
  playersInGame: number,
  gameId: string
): Promise<Card[]> => {
  const cards = await fetchCards(gameId);
  if (!cards) {
    return [];
  }
  return cards
    .filter((_val, index) => isPlayersCard(player, playersInGame, index))
    .filter((container) => !container.isPlayed)
    .sort((a, b) => getRank(a.card) - getRank(b.card))
    .sort((a, b) => getSuit(a.card) - getSuit(b.card))
    .map((container) => container.card);
};

export const hasTooManyCards = async (
  player: number,
  playersInGame: number,
  gameId: string
): Promise<boolean> => {
  return getPlayersCards(player, playersInGame, gameId).then((cards) => {
    return cards.length > cardsInHand(playersInGame);
  });
};

export const removeCard = async (
  cardToBeRemoved: Card,
  gameId: string
): Promise<void> => {
  const cards = await fetchCards(gameId);

  cards.find(
    (container) =>
      container.card.rank === cardToBeRemoved.rank &&
      container.card.suit === cardToBeRemoved.suit
  ).isPlayed = true;

  storeCards(cards, gameId);
};

export const hasPlayerCard = async (
  player: number,
  playersInGame: number,
  card: Card,
  gameId: string
): Promise<boolean> => {
  const cards = await getPlayersCards(player, playersInGame, gameId);
  return cards.some(
    (pc: Card) => pc.rank === card.rank && pc.suit === card.suit
  );
};
