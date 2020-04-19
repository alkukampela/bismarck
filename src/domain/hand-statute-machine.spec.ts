import { Player } from './player';
import { HandStatuteMachine } from './hand-statute-machine';
import { Suit } from '../types/suit';
import { GameType } from '../types/game-type';
import { HandStatute } from '../types/hand-statute';

const PLAYER_1 = new Player('ake');
const PLAYER_2 = new Player('make');
const PLAYER_3 = new Player('pera');
const PLAYER_4 = new Player('mä');

const PLAYERS = [PLAYER_1, PLAYER_2, PLAYER_3, PLAYER_4];

const handStatuteMachine = new HandStatuteMachine();

test('Ensure hand rules are correct for last trump hand', () => {
  const actual = handStatuteMachine.getHandStatute(PLAYERS, 3, Suit.SPADE);

  expect(actual.handType.isChoice).toBe(false);
  expect(actual.handType.gameType.value).toBe(GameType.TRUMP);
  expect(actual.handType.gameType.trumpSuit).toBe(Suit.SPADE);
  expect(actual.playerOrder[0]).toBe(PLAYER_4.getName());
});

test('Ensure hand rules are correct for first no-trump hand', () => {
  const actual = handStatuteMachine.getHandStatute(PLAYERS, 4, Suit.SPADE);

  expect(actual.handType.isChoice).toBe(false);
  expect(actual.handType.gameType.value).toBe(GameType.NO_TRUMP);
  expect(actual.handType.gameType.trumpSuit).toBeUndefined();
  expect(actual.playerOrder[0]).toBe(PLAYER_1.getName());
});

test('Ensure hand rules are correct for second misere hand', () => {
  const actual = handStatuteMachine.getHandStatute(PLAYERS, 8, Suit.SPADE);

  expect(actual.handType.isChoice).toBe(false);
  expect(actual.handType.gameType.value).toBe(GameType.MISERE);
  expect(actual.handType.gameType.trumpSuit).toBeUndefined();
  expect(actual.playerOrder[0]).toBe(PLAYER_1.getName());
});

test('Ensure hand rules are correct for third choice', () => {
  const actual = handStatuteMachine.getHandStatute(PLAYERS, 14, Suit.SPADE);

  expect(actual.handType.isChoice).toBe(true);
  expect(actual.handType.gameType).toBeUndefined();
  expect(actual.playerOrder[0]).toBe(PLAYER_3.getName());
});

test('Ensure returns correct statute after choosing trump', () => {
  const actual = handStatuteMachine.chooseGameType(
    getEmptyChoiceStatute(),
    GameType.TRUMP,
    Suit.DIAMOND
  );

  expect(actual.playerOrder).toStrictEqual(getEmptyChoiceStatute().playerOrder);
  expect(actual.handType.isChoice).toBe(true);
  expect(actual.handType.gameType.value).toBe(GameType.TRUMP);
  expect(actual.handType.gameType.trumpSuit).toBe(Suit.DIAMOND);
});

test('Ensure returns correct statute after choosing no trump', () => {
  const actual = handStatuteMachine.chooseGameType(
    getEmptyChoiceStatute(),
    GameType.NO_TRUMP
  );

  expect(actual.playerOrder).toStrictEqual(getEmptyChoiceStatute().playerOrder);
  expect(actual.handType.isChoice).toBe(true);
  expect(actual.handType.gameType.value).toBe(GameType.NO_TRUMP);
  expect(actual.handType.gameType.trumpSuit).toBeUndefined();
});

test('Ensure returns correct statute after choosing misere', () => {
  const actual = handStatuteMachine.chooseGameType(
    getEmptyChoiceStatute(),
    GameType.MISERE
  );

  expect(actual.playerOrder).toStrictEqual(getEmptyChoiceStatute().playerOrder);
  expect(actual.handType.isChoice).toBe(true);
  expect(actual.handType.gameType.value).toBe(GameType.MISERE);
  expect(actual.handType.gameType.trumpSuit).toBeUndefined();
});

function getEmptyChoiceStatute(): HandStatute {
  return {
    playerOrder: PLAYERS.map((player) => player.getName()),
    handType: {
      isChoice: true,
    },
  };
}
