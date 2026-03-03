import {
  initTrick,
  hasPlayerTurn,
  isTrickReady,
  playCard,
  getTaker,
} from './trick-machine';
import { GameType } from '../../../types/game-type';
import { SuitEnum } from '../../../types/suit';
import { Card } from '../../../types/card';

const PLAYER_1 = { name: 'Herkko' };
const PLAYER_2 = { name: 'Jyrki' };
const PLAYER_3 = { name: 'Mauri' };
const PLAYERS = [PLAYER_1, PLAYER_2, PLAYER_3];

test('Ensure misere trick is initalized correctly', () => {
  const CARD: Card = { rank: '3', suit: '♣️' };

  const actual = initTrick(
    CARD,
    PLAYER_1,
    {
      playerOrder: PLAYERS,
      isChoice: false,
      gameType: {
        value: GameType.MISERE,
      },
      eldestHand: PLAYER_1,
      tricksInHand: 0,
    },
    0
  );

  expect(actual.trickCards.length).toBe(3);
  expect(actual.trickCards[0].player).toBe(PLAYER_1);
  expect(actual.trickCards[0].card).toBe(CARD);
  expect(actual.trickSuit).toBe(SuitEnum.CLUB);
  expect(actual.trumpSuit).toBe(SuitEnum.CLUB);
});

test('Ensure no trump trick is initialized correctly', () => {
  const CARD: Card = { rank: '3', suit: '♠️' };

  const actual = initTrick(
    CARD,
    PLAYER_1,
    {
      playerOrder: PLAYERS,
      isChoice: false,
      gameType: {
        value: GameType.NO_TRUMP,
      },
      eldestHand: PLAYER_1,
      tricksInHand: 0,
    },
    0
  );

  expect(actual.trickCards.length).toBe(3);
  expect(actual.trickCards[0].player).toBe(PLAYER_1);
  expect(actual.trickCards[0].card).toBe(CARD);
  expect(actual.trickSuit).toBe(SuitEnum.SPADE);
  expect(actual.trumpSuit).toBe(SuitEnum.SPADE);
});

test('Ensure trump trick is initialized correctly', () => {
  const card: Card = { rank: '3', suit: '♦️' };

  const actual = initTrick(
    card,
    PLAYER_1,
    {
      playerOrder: PLAYERS,
      isChoice: false,
      gameType: {
        value: GameType.TRUMP,
        trumpSuit: SuitEnum.SPADE,
      },
      eldestHand: PLAYER_1,
      tricksInHand: 0,
    },
    0
  );

  expect(actual.trickCards.length).toBe(3);
  expect(actual.trickCards[0].player).toBe(PLAYER_1);
  expect(actual.trickCards[0].card).toBe(card);
  expect(actual.trickSuit).toBe(SuitEnum.DIAMOND);
  expect(actual.trumpSuit).toBe(SuitEnum.SPADE);
});

test('Ensure trump trick is initialized correctly with diamond suit', () => {
  const card: Card = { rank: '3', suit: '♠️' };

  const actual = initTrick(
    card,
    PLAYER_1,
    {
      playerOrder: PLAYERS,
      isChoice: false,
      gameType: {
        value: GameType.TRUMP,
        trumpSuit: SuitEnum.DIAMOND,
      },
      eldestHand: PLAYER_1,
      tricksInHand: 0,
    },
    0
  );

  expect(actual.trickCards.length).toBe(3);
  expect(actual.trickCards[0].player).toBe(PLAYER_1);
  expect(actual.trickCards[0].card).toBe(card);
  expect(actual.trickSuit).toBe(SuitEnum.SPADE);
  expect(actual.trumpSuit).toBe(SuitEnum.DIAMOND);
});

test('Ensure all cards are not played when trick is ongoing', () => {
  const card: Card = { rank: '3', suit: '♦️' };

  const trick = {
    trickCards: [{ player: PLAYER_1, card }, { player: PLAYER_2 }],
    trumpSuit: SuitEnum.CLUB,
    trickSuit: SuitEnum.CLUB,
    trickNumber: 0,
  };

  const actual = isTrickReady(trick);

  expect(actual).toBe(false);
});

test('Ensure all cards are played when trick is finished', () => {
  const card: Card = { rank: '3', suit: '♦️' };

  const trick = {
    trickCards: [
      { player: PLAYER_1, card },
      { player: PLAYER_2, card },
    ],
    trumpSuit: SuitEnum.CLUB,
    trickSuit: SuitEnum.CLUB,
    trickNumber: 0,
  };

  const actual = isTrickReady(trick);

  expect(actual).toBe(true);
});

test('Ensure second player has next turn after first card', () => {
  const card: Card = { rank: '3', suit: '♦️' };

  const trick = {
    trickCards: [
      { player: PLAYER_1, card },
      { player: PLAYER_2 },
      { player: PLAYER_3 },
    ],
    trumpSuit: SuitEnum.CLUB,
    trickSuit: SuitEnum.CLUB,
    trickNumber: 0,
  };

  expect(hasPlayerTurn(trick, PLAYER_1)).toBe(false);
  expect(hasPlayerTurn(trick, PLAYER_2)).toBe(true);
  expect(hasPlayerTurn(trick, PLAYER_3)).toBe(false);
});

test('Ensure no player has next turn when trick is ready', () => {
  const card: Card = { rank: '3', suit: '♦️' };

  const trick = {
    trickCards: [
      { player: PLAYER_1, card },
      { player: PLAYER_2, card },
      { player: PLAYER_3, card },
    ],
    trumpSuit: SuitEnum.CLUB,
    trickSuit: SuitEnum.CLUB,
    trickNumber: 0,
  };

  expect(hasPlayerTurn(trick, PLAYER_1)).toBe(false);
  expect(hasPlayerTurn(trick, PLAYER_2)).toBe(false);
  expect(hasPlayerTurn(trick, PLAYER_3)).toBe(false);
});

test('Ensure card is played properly', () => {
  const existingCard: Card = { rank: '3', suit: '♦️' };
  const playersCard: Card = { rank: '6', suit: '♦️' };

  const trick = {
    trickCards: [
      { player: PLAYER_1, card: existingCard },
      { player: PLAYER_2 },
      { player: PLAYER_3 },
    ],
    trumpSuit: SuitEnum.CLUB,
    trickSuit: SuitEnum.CLUB,
    trickNumber: 0,
  };

  const actual = playCard(trick, PLAYER_2, playersCard);

  expect(actual.trickCards[0].player).toBe(PLAYER_1);
  expect(actual.trickCards[0].card).toBe(existingCard);
  expect(actual.trickCards[1].player).toBe(PLAYER_2);
  expect(actual.trickCards[1].card).toBe(playersCard);
  expect(actual.trickCards[2].player).toBe(PLAYER_3);
  expect(actual.trickCards[2].card).toBe(undefined);
});

test('Ensure first player wins with higher rank', () => {
  const card1: Card = { rank: 'J', suit: '♦️' };
  const card2: Card = { rank: '3', suit: '♦️' };

  const trick = {
    trickCards: [
      { player: PLAYER_1, card: card1 },
      { player: PLAYER_2, card: card2 },
    ],
    trumpSuit: SuitEnum.DIAMOND,
    trickSuit: SuitEnum.DIAMOND,
    trickNumber: 0,
  };

  expect(getTaker(trick)).toBe(PLAYER_1);
});

test('Ensure second player wins with higher rank', () => {
  const card1: Card = { rank: '2', suit: '♥️' };
  const card2: Card = { rank: '3', suit: '♥️' };

  const trick = {
    trickCards: [
      { player: PLAYER_1, card: card1 },
      { player: PLAYER_2, card: card2 },
    ],
    trumpSuit: SuitEnum.HEART,
    trickSuit: SuitEnum.HEART,
    trickNumber: 0,
  };

  expect(getTaker(trick)).toBe(PLAYER_2);
});

test('Ensure lower rank with trick suit wins when no trump', () => {
  const card1: Card = { rank: '2', suit: '♥️' };
  const card2: Card = { rank: '9', suit: '♠️' };

  const trick = {
    trickCards: [
      { player: PLAYER_1, card: card1 },
      { player: PLAYER_2, card: card2 },
    ],
    trumpSuit: SuitEnum.HEART,
    trickSuit: SuitEnum.HEART,
    trickNumber: 0,
  };

  expect(getTaker(trick)).toBe(PLAYER_1);
});

test('Ensure lower rank with trump suit wins when trump', () => {
  const card1: Card = { rank: '2', suit: '♦️' };
  const card2: Card = { rank: 'A', suit: '♠️' };

  const trick = {
    trickCards: [
      { player: PLAYER_1, card: card1 },
      { player: PLAYER_2, card: card2 },
    ],
    trumpSuit: SuitEnum.DIAMOND,
    trickSuit: SuitEnum.SPADE,
    trickNumber: 0,
  };

  expect(getTaker(trick)).toBe(PLAYER_1);
});

test('Ensure highest rank trick card wins when no trump cards in trick', () => {
  const card1: Card = { rank: '4', suit: '♦️' };
  const card2: Card = { rank: '5', suit: '♦️' };

  const trick = {
    trickCards: [
      { player: PLAYER_1, card: card1 },
      { player: PLAYER_2, card: card2 },
    ],
    trumpSuit: SuitEnum.HEART,
    trickSuit: SuitEnum.DIAMOND,
    trickNumber: 0,
  };

  expect(getTaker(trick)).toBe(PLAYER_2);
});
