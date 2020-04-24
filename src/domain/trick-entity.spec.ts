import { CardEntity } from './card-entity';
import { TrickEntity } from './trick-entity';
import { Suit } from '../types/suit';
import { HandStatute } from '../types/hand-statute';
import { GameType } from '../types/game-type';

const PLAYER_1 = { name: 'ake' };
const PLAYER_2 = { name: 'make' };
const PLAYER_3 = { name: 'pera' };

const SPADE_A = new CardEntity(51);
const SPADE_K = new CardEntity(50);
const SPADE_2 = new CardEntity(39);
const HEART_A = new CardEntity(38);
const HEART_K = new CardEntity(37);

test('First player wins with highest card when no trump', () => {
  const trick = new TrickEntity(SPADE_A, PLAYER_1, statute(2));
  trick.playCard(SPADE_2, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_1);
});

test('Second player wins with highest card when no trump', () => {
  const trick = new TrickEntity(SPADE_2, PLAYER_1, statute(2));
  trick.playCard(SPADE_A, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_2);
});

test('First player wins with lower card with correct suit', () => {
  const trick = new TrickEntity(HEART_K, PLAYER_1, statute(2));
  trick.playCard(SPADE_A, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_1);
});

test('First player wins with highest trump card when trump', () => {
  const trick = new TrickEntity(HEART_A, PLAYER_1, statute(2, Suit.HEART));
  trick.playCard(HEART_K, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_1);
});

test('Second player wins with trump card when trump', () => {
  const trick = new TrickEntity(SPADE_A, PLAYER_1, statute(2, Suit.HEART));
  trick.playCard(HEART_K, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_2);
});

test('Highest trick suit cards when no trump cards are played', () => {
  const trick = new TrickEntity(SPADE_2, PLAYER_1, statute(2, Suit.HEART));
  trick.playCard(SPADE_A, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_2);
});

test('Ensure allCardsArePlayed is false with 1/3 players', () => {
  const trick = new TrickEntity(SPADE_2, PLAYER_1, statute(3));
  expect(trick.allCardsArePlayed()).toBe(false);
});

test('Ensure allCardsArePlayed is false with 2/3 players', () => {
  const trick = new TrickEntity(SPADE_2, PLAYER_1, statute(3));
  trick.playCard(SPADE_A, PLAYER_2);

  expect(trick.allCardsArePlayed()).toBe(false);
});

test('Ensure allCardsArePlayed is true when trick is finished', () => {
  const trick = new TrickEntity(SPADE_2, PLAYER_1, statute(3));
  trick.playCard(SPADE_A, PLAYER_2);
  trick.playCard(SPADE_K, PLAYER_3);

  expect(trick.allCardsArePlayed()).toBe(true);
});

const statute = (numberOfPlayers: number, suit?: Suit): HandStatute => {
  return {
    playerOrder:
      numberOfPlayers === 2
        ? [PLAYER_1, PLAYER_2]
        : [PLAYER_1, PLAYER_2, PLAYER_3],
    handType: {
      isChoice: false,
      gameType: {
        trumpSuit: suit,
        value: !!suit ? GameType.TRUMP : GameType.NO_TRUMP,
      },
    },
  };
};
