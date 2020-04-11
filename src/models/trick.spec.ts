import { Card } from './card';
import { Trick } from './trick';
import { Player } from './player';
import { Suit } from './suit';

const PLAYER_1 = new Player('ake');
const PLAYER_2 = new Player('make');

const SPADE_A = new Card(51);
const SPADE_2 = new Card(39);
const HEART_A = new Card(38);
const HEART_K = new Card(37);

test('First player wins with highest card when no trump', () => {
  const trick = new Trick(SPADE_A, PLAYER_1);
  trick.playCard(SPADE_2, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_1);
});

test('Second player wins with highest card when no trump', () => {
  const trick = new Trick(SPADE_2, PLAYER_1);
  trick.playCard(SPADE_A, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_2);
});

test('First player wins with lower card with correct suit', () => {
  const trick = new Trick(HEART_K, PLAYER_1);
  trick.playCard(SPADE_A, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_1);
});

test('First player wins with highest trump card when trump', () => {
  const trick = new Trick(HEART_A, PLAYER_1, Suit.HEART);
  trick.playCard(HEART_K, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_1);
});

test('Second player wins with trump card when trump', () => {
  const trick = new Trick(SPADE_A, PLAYER_1, Suit.HEART);
  trick.playCard(HEART_K, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_2);
});

test('Highest trick suit cards when no trump cards are played', () => {
  const trick = new Trick(SPADE_2, PLAYER_1, Suit.HEART);
  trick.playCard(SPADE_A, PLAYER_2);

  expect(trick.getTaker()).toBe(PLAYER_2);
});

test('Trick cards are counted correctly', () => {
  const trick = new Trick(SPADE_2, PLAYER_1, Suit.HEART);
  expect(trick.playedCards()).toBe(1);

  trick.playCard(SPADE_A, PLAYER_2);
  expect(trick.playedCards()).toBe(2);
});

test('Latest player is returned correctly', () => {
  const trick = new Trick(SPADE_2, PLAYER_1, Suit.HEART);
  expect(trick.getLatestPlayer()).toBe(PLAYER_1);

  trick.playCard(SPADE_A, PLAYER_2);
  expect(trick.getLatestPlayer()).toBe(PLAYER_2);
});
