import { CardEntity } from './card-entity';
import { TrickEntity } from './trick-entity';
import { Player } from './player';
import { Suit } from '../types/suit';

const PLAYER_1 = new Player('ake');
const PLAYER_2 = new Player('make');
const PLAYER_3 = new Player('pera');
const PLAYER_4 = new Player('mä');

const PLAYERS = [PLAYER_1, PLAYER_2];

const SPADE_A = new CardEntity(51);
const SPADE_2 = new CardEntity(39);
const HEART_A = new CardEntity(38);
const HEART_K = new CardEntity(37);

test('First player wins with highest card when no trump', () => {
  const trick = new TrickEntity(SPADE_A, PLAYERS);
  trick.playCard(SPADE_2, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_1);
});

test('Second player wins with highest card when no trump', () => {
  const trick = new TrickEntity(SPADE_2, PLAYERS);
  trick.playCard(SPADE_A, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_2);
});

test('First player wins with lower card with correct suit', () => {
  const trick = new TrickEntity(HEART_K, PLAYERS);
  trick.playCard(SPADE_A, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_1);
});

test('First player wins with highest trump card when trump', () => {
  const trick = new TrickEntity(HEART_A, PLAYERS, Suit.HEART);
  trick.playCard(HEART_K, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_1);
});

test('Second player wins with trump card when trump', () => {
  const trick = new TrickEntity(SPADE_A, PLAYERS, Suit.HEART);
  trick.playCard(HEART_K, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_2);
});

test('Highest trick suit cards when no trump cards are played', () => {
  const trick = new TrickEntity(SPADE_2, PLAYERS, Suit.HEART);
  trick.playCard(SPADE_A, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_2);
});

test('Trick cards are counted correctly', () => {
  const trick = new TrickEntity(SPADE_2, PLAYERS, Suit.HEART);
  expect(trick.playedCards()).toBe(1);

  trick.playCard(SPADE_A, PLAYER_2);
  expect(trick.playedCards()).toBe(2);
});

test('Latest player is returned correctly', () => {
  const trick = new TrickEntity(SPADE_2, PLAYERS, Suit.HEART);
  expect(trick.getLatestPlayer()).toBe(PLAYER_1);

  trick.playCard(SPADE_A, PLAYER_2);
  expect(trick.getLatestPlayer()).toBe(PLAYER_2);
});
