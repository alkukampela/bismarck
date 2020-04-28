import { HandScore } from './hand-score';
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

test('Ensure hand scores are calculated correctly in trump game', () => {
  const handScore = new HandScore([PLAYER_1, PLAYER_2, PLAYER_3, PLAYER_4]);

  handScore.takeTrick(PLAYER_1);
  handScore.takeTrick(PLAYER_1);
  handScore.takeTrick(PLAYER_1);
  handScore.takeTrick(PLAYER_1);
  handScore.takeTrick(PLAYER_1);
  handScore.takeTrick(PLAYER_1);

  handScore.takeTrick(PLAYER_2);
  handScore.takeTrick(PLAYER_2);
  handScore.takeTrick(PLAYER_2);
  handScore.takeTrick(PLAYER_2);

  handScore.takeTrick(PLAYER_3);
  handScore.takeTrick(PLAYER_3);

  const actual = handScore.getScores(GameType.TRUMP);

  expect(getScoreForPlayer(actual, PLAYER_1)).toBe(0);
  expect(getScoreForPlayer(actual, PLAYER_2)).toBe(2);
  expect(getScoreForPlayer(actual, PLAYER_3)).toBe(0);
  expect(getScoreForPlayer(actual, PLAYER_4)).toBe(-2);
});

test('Ensure hand scores are calculated correctly in no-trump game', () => {
  const handScore = new HandScore([PLAYER_1, PLAYER_2, PLAYER_3, PLAYER_4]);

  handScore.takeTrick(PLAYER_1);
  handScore.takeTrick(PLAYER_1);
  handScore.takeTrick(PLAYER_1);
  handScore.takeTrick(PLAYER_1);
  handScore.takeTrick(PLAYER_1);

  handScore.takeTrick(PLAYER_2);
  handScore.takeTrick(PLAYER_2);
  handScore.takeTrick(PLAYER_2);
  handScore.takeTrick(PLAYER_2);

  handScore.takeTrick(PLAYER_3);
  handScore.takeTrick(PLAYER_3);
  handScore.takeTrick(PLAYER_3);

  const actual = handScore.getScores(GameType.NO_TRUMP);

  expect(getScoreForPlayer(actual, PLAYER_1)).toBe(-1);
  expect(getScoreForPlayer(actual, PLAYER_2)).toBe(2);
  expect(getScoreForPlayer(actual, PLAYER_3)).toBe(1);
  expect(getScoreForPlayer(actual, PLAYER_4)).toBe(-2);
});

test('Ensure hand scores are calculated correctly in misere game', () => {
  const handScore = new HandScore([PLAYER_1, PLAYER_2, PLAYER_3, PLAYER_4]);

  handScore.takeTrick(PLAYER_1);

  handScore.takeTrick(PLAYER_2);
  handScore.takeTrick(PLAYER_2);
  handScore.takeTrick(PLAYER_2);
  handScore.takeTrick(PLAYER_2);

  handScore.takeTrick(PLAYER_3);
  handScore.takeTrick(PLAYER_3);

  handScore.takeTrick(PLAYER_4);
  handScore.takeTrick(PLAYER_4);
  handScore.takeTrick(PLAYER_4);
  handScore.takeTrick(PLAYER_4);
  handScore.takeTrick(PLAYER_4);

  const actual = handScore.getScores(GameType.MISERE);

  expect(getScoreForPlayer(actual, PLAYER_1)).toBe(-1);
  expect(getScoreForPlayer(actual, PLAYER_2)).toBe(0);
  expect(getScoreForPlayer(actual, PLAYER_3)).toBe(2);
  expect(getScoreForPlayer(actual, PLAYER_4)).toBe(-1);
});
