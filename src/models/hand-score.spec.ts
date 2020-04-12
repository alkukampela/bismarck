import { Player } from './player';
import { HandScore } from './hand-score';

const PLAYER_1 = new Player('ake');
const PLAYER_2 = new Player('make');
const PLAYER_3 = new Player('pera');
const PLAYER_4 = new Player('mä');

test('Ensure hand scores are calculated correctly', () => {
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

  const actual = handScore.getScores();

  expect(actual[PLAYER_1.getName()]).toBe(0);
  expect(actual[PLAYER_2.getName()]).toBe(2);
  expect(actual[PLAYER_3.getName()]).toBe(0);
  expect(actual[PLAYER_4.getName()]).toBe(-2);
});
