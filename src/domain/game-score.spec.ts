import { GameScoreManager } from './game-score-manager';
import { GameScoreBoard } from '../types/game-score-board';
import { Player } from '../types/player';

const PLAYER_1 = { name: 'ake' };
const PLAYER_2 = { name: 'make' };
const PLAYER_3 = { name: 'pera' };
const PLAYER_4 = { name: 'mä' };

const getPlayersTotalScore = (
  player: Player,
  scoreBoard: GameScoreBoard
): number => {
  return scoreBoard.totalScore.filter(
    (playerScore) => playerScore.player.name === player.name
  )[0].score;
};

const getPlayersTrickScore = (
  player: Player,
  trick: number,
  scoreBoard: GameScoreBoard
): number => {
  return scoreBoard.trickScores[trick].filter(
    (playerScore) => playerScore.player.name === player.name
  )[0].score;
};

test('Ensure trick scores are stored correctly', () => {
  const gameScore = new GameScoreManager();

  gameScore.saveTrick([
    { player: PLAYER_1, score: 2 },
    { player: PLAYER_2, score: 3 },
    { player: PLAYER_3, score: -1 },
    { player: PLAYER_4, score: -4 },
  ]);

  gameScore.saveTrick([
    { player: PLAYER_1, score: 1 },
    { player: PLAYER_2, score: -1 },
    { player: PLAYER_3, score: -1 },
    { player: PLAYER_4, score: 1 },
  ]);

  const actual = gameScore.getScoreBoard();

  expect(actual.trickScores.length).toBe(2);

  expect(getPlayersTrickScore(PLAYER_1, 0, actual)).toBe(2);
  expect(getPlayersTrickScore(PLAYER_2, 0, actual)).toBe(3);
  expect(getPlayersTrickScore(PLAYER_3, 0, actual)).toBe(-1);
  expect(getPlayersTrickScore(PLAYER_4, 0, actual)).toBe(-4);

  expect(getPlayersTrickScore(PLAYER_1, 1, actual)).toBe(1);
  expect(getPlayersTrickScore(PLAYER_2, 1, actual)).toBe(-1);
  expect(getPlayersTrickScore(PLAYER_3, 1, actual)).toBe(-1);
  expect(getPlayersTrickScore(PLAYER_4, 1, actual)).toBe(1);
});

test('Ensure total scores are calculated correctly', () => {
  const gameScore = new GameScoreManager();

  gameScore.saveTrick([
    { player: PLAYER_1, score: 2 },
    { player: PLAYER_2, score: 3 },
    { player: PLAYER_3, score: -1 },
    { player: PLAYER_4, score: -4 },
  ]);

  gameScore.saveTrick([
    { player: PLAYER_1, score: 1 },
    { player: PLAYER_2, score: -1 },
    { player: PLAYER_3, score: -1 },
    { player: PLAYER_4, score: 1 },
  ]);

  const actual = gameScore.getScoreBoard();

  expect(getPlayersTotalScore(PLAYER_1, actual)).toBe(3);
  expect(getPlayersTotalScore(PLAYER_2, actual)).toBe(2);
  expect(getPlayersTotalScore(PLAYER_3, actual)).toBe(-2);
  expect(getPlayersTotalScore(PLAYER_4, actual)).toBe(-3);
});
