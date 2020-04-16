import { Player } from './player';
import { GameScore } from './game-score';
import { GameStatus } from '../types/game-status';

const PLAYER_1 = new Player('ake');
const PLAYER_2 = new Player('make');
const PLAYER_3 = new Player('pera');
const PLAYER_4 = new Player('mä');

test('Ensure hand scores are calculated correctly', () => {
  const gameScore = new GameScore([PLAYER_1, PLAYER_2, PLAYER_3, PLAYER_4]);

  const actual = gameScore.getStatus();

  expect(actual.tricks).toBe(0);
  expect(getPlayersScore(PLAYER_1, actual)).toBe(0);
  expect(getPlayersScore(PLAYER_2, actual)).toBe(0);
  expect(getPlayersScore(PLAYER_3, actual)).toBe(0);
  expect(getPlayersScore(PLAYER_4, actual)).toBe(0);
});

test('Ensure hand scores are calculated correctly', () => {
  const gameScore = new GameScore([PLAYER_1, PLAYER_2, PLAYER_3, PLAYER_4]);

  gameScore.saveTrick([
    { player: PLAYER_1.getName(), score: 2 },
    { player: PLAYER_2.getName(), score: 3 },
    { player: PLAYER_3.getName(), score: -1 },
    { player: PLAYER_4.getName(), score: -4 },
  ]);

  const actual = gameScore.getStatus();

  expect(actual.tricks).toBe(1);
  expect(getPlayersScore(PLAYER_1, actual)).toBe(2);
  expect(getPlayersScore(PLAYER_2, actual)).toBe(3);
  expect(getPlayersScore(PLAYER_3, actual)).toBe(-1);
  expect(getPlayersScore(PLAYER_4, actual)).toBe(-4);
});

test('Ensure hand scores are calculated correctly', () => {
  const gameScore = new GameScore([PLAYER_1, PLAYER_2, PLAYER_3, PLAYER_4]);

  gameScore.saveTrick([
    { player: PLAYER_1.getName(), score: 2 },
    { player: PLAYER_2.getName(), score: 3 },
    { player: PLAYER_3.getName(), score: -1 },
    { player: PLAYER_4.getName(), score: -4 },
  ]);

  gameScore.saveTrick([
    { player: PLAYER_1.getName(), score: 1 },
    { player: PLAYER_2.getName(), score: -1 },
    { player: PLAYER_3.getName(), score: -1 },
    { player: PLAYER_4.getName(), score: 1 },
  ]);

  const actual = gameScore.getStatus();

  expect(actual.tricks).toBe(2);
  expect(getPlayersScore(PLAYER_1, actual)).toBe(3);
  expect(getPlayersScore(PLAYER_2, actual)).toBe(2);
  expect(getPlayersScore(PLAYER_3, actual)).toBe(-2);
  expect(getPlayersScore(PLAYER_4, actual)).toBe(-3);
});

const getPlayersScore = (player: Player, gameStatus: GameStatus): number => {
  return gameStatus.scores.filter((x) => x.player === player.getName())[0]
    .score;
};
