import { getSuit, getRank, fromNumber } from './card-mapper';
import { Suit } from '../types/suit';

test('Ensure suit is mapped correctly from diamond', () => {
  const card = { suit: '♦️', rank: 'A' };

  expect(getSuit(card)).toBe(Suit.DIAMOND);
});

test('Ensure suit is mapped correctly from club', () => {
  const card = { suit: '♣️', rank: 'A' };

  expect(getSuit(card)).toBe(Suit.CLUB);
});

test('Ensure suit is mapped correctly from heart', () => {
  const card = { suit: '♥️', rank: 'A' };

  expect(getSuit(card)).toBe(Suit.HEART);
});

test('Ensure suit is mapped correctly from spade', () => {
  const card = { suit: '♠️', rank: 'A' };

  expect(getSuit(card)).toBe(Suit.SPADE);
});

test('Ensure ace rank is mapped to 12', () => {
  const card = { suit: '♠️', rank: 'A' };

  expect(getRank(card)).toBe(12);
});

test('Ensure king rank is mapped to 11', () => {
  const card = { suit: '♠️', rank: 'K' };

  expect(getRank(card)).toBe(11);
});

test('Ensure queen rank is mapped to 10', () => {
  const card = { suit: '♠️', rank: 'Q' };

  expect(getRank(card)).toBe(10);
});

test('Ensure jack rank is mapped to 9', () => {
  const card = { suit: '♠️', rank: 'J' };

  expect(getRank(card)).toBe(9);
});

test('Ensure 10 rank is mapped to 8', () => {
  const card = { suit: '♠️', rank: '10' };

  expect(getRank(card)).toBe(8);
});

test('Ensure 2 rank is mapped to 2', () => {
  const card = { suit: '♠️', rank: '2' };

  expect(getRank(card)).toBe(0);
});

test('Ensure diamond card is mapped correctly', () => {
  const card = fromNumber(0);

  expect(card.rank).toBe('2');
  expect(card.suit).toBe('♦️');
});

test('Ensure club card is mapped correctly', () => {
  const card = fromNumber(13);

  expect(card.rank).toBe('2');
  expect(card.suit).toBe('♣️');
});

test('Ensure heart card is mapped correctly', () => {
  const card = fromNumber(33);

  expect(card.rank).toBe('9');
  expect(card.suit).toBe('♥️');
});

test('Ensure spade card is mapped correctly', () => {
  const card = fromNumber(51);

  expect(card.rank).toBe('A');
  expect(card.suit).toBe('♠️');
});
