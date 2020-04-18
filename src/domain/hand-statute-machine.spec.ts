import { Player } from './player';
import { HandStatuteMachine } from './hand-statute-machine';
import { Suit } from '../types/suit';
import { GameType } from '../types/game-type';

const PLAYER_1 = new Player('ake');
const PLAYER_2 = new Player('make');
const PLAYER_3 = new Player('pera');
const PLAYER_4 = new Player('mä');

const PLAYERS = [PLAYER_1, PLAYER_2, PLAYER_3, PLAYER_4];

const handRuleMachine = new HandStatuteMachine();

test('Ensure hand rules are correct for last trump hand', () => {
  const actual = handRuleMachine.getHandStatute(PLAYERS, 3, Suit.SPADE);

  expect(actual.handType.isChoice).toBe(false);
  expect(actual.handType.gameType.value).toBe(GameType.TRUMP);
  expect(actual.handType.gameType.trumpSuit).toBe(Suit.SPADE);
  expect(actual.playerOrder[0]).toBe(PLAYER_4.getName());
});

test('Ensure hand rules are correct for first no-trump hand', () => {
  const actual = handRuleMachine.getHandStatute(PLAYERS, 4, Suit.SPADE);

  expect(actual.handType.isChoice).toBe(false);
  expect(actual.handType.gameType.value).toBe(GameType.NO_TRUMP);
  expect(actual.handType.gameType.trumpSuit).toBeUndefined();
  expect(actual.playerOrder[0]).toBe(PLAYER_1.getName());
});

test('Ensure hand rules are correct for second misere hand', () => {
  const actual = handRuleMachine.getHandStatute(PLAYERS, 8, Suit.SPADE);

  expect(actual.handType.isChoice).toBe(false);
  expect(actual.handType.gameType.value).toBe(GameType.MISERE);
  expect(actual.handType.gameType.trumpSuit).toBeUndefined();
  expect(actual.playerOrder[0]).toBe(PLAYER_1.getName());
});

test('Ensure hand rules are correct for third choice', () => {
  const actual = handRuleMachine.getHandStatute(PLAYERS, 14, Suit.SPADE);

  expect(actual.handType.isChoice).toBe(true);
  expect(actual.handType.gameType).toBeUndefined();
  expect(actual.playerOrder[0]).toBe(PLAYER_3.getName());
});
