import { getHandsPoints, updatedTrickScore } from './hand-score';
import { GameType } from '../types/game-type';
import { Player } from '../types/player';
import { PlayerScore } from '../types/player-score';

const PLAYER_1 = { name: 'ake' };
const PLAYER_2 = { name: 'make' };
const PLAYER_3 = { name: 'pera' };
const PLAYER_4 = { name: 'mä' };

const getScoreForPlayer = (scores: PlayerScore[], player: Player): number => {
  return scores.filter((x) => x.player.name === player.name)[0].score;
};

test('Ensure hand scores are correct in four player trump game', () => {
  const scores = [
    { player: PLAYER_1, score: 6 },
    { player: PLAYER_2, score: 4 },
    { player: PLAYER_3, score: 2 },
    { player: PLAYER_4, score: 0 },
  ];

  const actual = getHandsPoints(scores, GameType.TRUMP);

  expect(getScoreForPlayer(actual, PLAYER_1)).toBe(0);
  expect(getScoreForPlayer(actual, PLAYER_2)).toBe(2);
  expect(getScoreForPlayer(actual, PLAYER_3)).toBe(0);
  expect(getScoreForPlayer(actual, PLAYER_4)).toBe(-2);
});

test('Ensure hand scores are correct in four player no trump game', () => {
  const scores = [
    { player: PLAYER_1, score: 5 },
    { player: PLAYER_2, score: 4 },
    { player: PLAYER_3, score: 2 },
    { player: PLAYER_4, score: 1 },
  ];

  const actual = getHandsPoints(scores, GameType.NO_TRUMP);

  expect(getScoreForPlayer(actual, PLAYER_1)).toBe(-1);
  expect(getScoreForPlayer(actual, PLAYER_2)).toBe(2);
  expect(getScoreForPlayer(actual, PLAYER_3)).toBe(0);
  expect(getScoreForPlayer(actual, PLAYER_4)).toBe(-1);
});

test('Ensure hand scores are correct in four player misere game', () => {
  const scores = [
    { player: PLAYER_1, score: 1 },
    { player: PLAYER_2, score: 4 },
    { player: PLAYER_3, score: 2 },
    { player: PLAYER_4, score: 5 },
  ];

  const actual = getHandsPoints(scores, GameType.MISERE);

  expect(getScoreForPlayer(actual, PLAYER_1)).toBe(-1);
  expect(getScoreForPlayer(actual, PLAYER_2)).toBe(0);
  expect(getScoreForPlayer(actual, PLAYER_3)).toBe(2);
  expect(getScoreForPlayer(actual, PLAYER_4)).toBe(-1);
});

test('Ensure hand scores are correct in three player trump game', () => {
  const scores = [
    { player: PLAYER_1, score: 11 },
    { player: PLAYER_2, score: 3 },
    { player: PLAYER_3, score: 2 },
  ];

  const actual = getHandsPoints(scores, GameType.TRUMP);

  expect(getScoreForPlayer(actual, PLAYER_1)).toBe(3);
  expect(getScoreForPlayer(actual, PLAYER_2)).toBe(-1);
  expect(getScoreForPlayer(actual, PLAYER_3)).toBe(-2);
});

test('Ensure hand scores are correct in three player no trump game', () => {
  const scores = [
    { player: PLAYER_1, score: 8 },
    { player: PLAYER_2, score: 5 },
    { player: PLAYER_3, score: 3 },
  ];

  const actual = getHandsPoints(scores, GameType.NO_TRUMP);

  expect(getScoreForPlayer(actual, PLAYER_1)).toBe(0);
  expect(getScoreForPlayer(actual, PLAYER_2)).toBe(1);
  expect(getScoreForPlayer(actual, PLAYER_3)).toBe(-1);
});

test('Ensure hand scores are correct in three player misere game', () => {
  const scores = [
    { player: PLAYER_1, score: 3 },
    { player: PLAYER_2, score: 6 },
    { player: PLAYER_3, score: 7 },
  ];

  const actual = getHandsPoints(scores, GameType.MISERE);

  expect(getScoreForPlayer(actual, PLAYER_1)).toBe(-1);
  expect(getScoreForPlayer(actual, PLAYER_2)).toBe(1);
  expect(getScoreForPlayer(actual, PLAYER_3)).toBe(0);
});

test('Ensure trick taker is updated correctly', () => {
  const scores = [
    { player: PLAYER_1, score: 7 },
    { player: PLAYER_2, score: 4 },
  ];

  const actual = updatedTrickScore(PLAYER_1, scores);

  expect(actual).toStrictEqual([
    { player: PLAYER_1, score: 8 },
    { player: PLAYER_2, score: 4 },
  ]);
});
