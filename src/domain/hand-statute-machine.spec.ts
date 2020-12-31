import { Game } from '../types/game';
import { GameType } from '../types/game-type';
import { GameTypeChoice } from '../types/game-type-choice';
import { HandStatute } from '../types/hand-statute';
import { Player } from '../types/player';
import { Suit } from '../types/suit';
import { getHandStatute, getStatuteAfterChoice } from './hand-statute-machine';

const PLAYER_1: Player = { name: 'A' };
const PLAYER_2: Player = { name: 'B' };
const PLAYER_3: Player = { name: 'C' };

const initGame = (): Game => {
  return {
    players: [PLAYER_1, PLAYER_2, PLAYER_3],
    handNumber: 0,
  };
};

const TRICKS_IN_3_PLAYER_GAME = 16;

test('Ensure correct statute for second trump hand', () => {
  const inputGame: Game = { ...initGame(), handNumber: 1 };

  const actual = getHandStatute(inputGame, Suit.DIAMOND);

  expect(actual.eldestHand).toBe(PLAYER_2);
  expect(actual.handType.isChoice).toBeFalsy();
  expect(actual.handType.gameType).toEqual({
    value: GameType.TRUMP,
    trumpSuit: Suit.DIAMOND,
  });
  expect(actual.playerOrder).toStrictEqual([PLAYER_2, PLAYER_3, PLAYER_1]);
  expect(actual.tricksInHand).toBe(TRICKS_IN_3_PLAYER_GAME);
});

test('Ensure correct statute for first no trump hand', () => {
  const inputGame: Game = { ...initGame(), handNumber: 3 };

  const actual = getHandStatute(inputGame, null);

  expect(actual.eldestHand).toBe(PLAYER_1);
  expect(actual.handType.isChoice).toBeFalsy();
  expect(actual.handType.gameType).toEqual({
    value: GameType.NO_TRUMP,
  });
  expect(actual.playerOrder).toStrictEqual([PLAYER_1, PLAYER_2, PLAYER_3]);
  expect(actual.tricksInHand).toBe(TRICKS_IN_3_PLAYER_GAME);
});

test('Ensure correct statute for third misere hand', () => {
  const inputGame: Game = { ...initGame(), handNumber: 8 };

  const actual = getHandStatute(inputGame, null);

  expect(actual.eldestHand).toBe(PLAYER_3);
  expect(actual.handType.isChoice).toBeFalsy();
  expect(actual.handType.gameType).toEqual({
    value: GameType.MISERE,
  });
  expect(actual.playerOrder).toStrictEqual([PLAYER_3, PLAYER_1, PLAYER_2]);
  expect(actual.tricksInHand).toBe(TRICKS_IN_3_PLAYER_GAME);
});

test('Ensure correct statute for first choice game', () => {
  const inputGame: Game = { ...initGame(), handNumber: 9 };

  const actual = getHandStatute(inputGame, null);

  expect(actual.eldestHand).toBe(PLAYER_1);
  expect(actual.handType.isChoice).toBeTruthy();
  expect(actual.handType.gameType).toBeUndefined();
  expect(actual.playerOrder).toStrictEqual([PLAYER_1, PLAYER_2, PLAYER_3]);
  expect(actual.tricksInHand).toBe(TRICKS_IN_3_PLAYER_GAME);
});

test('Ensure correct statute for trump game choice', () => {
  const inputStatute: HandStatute = {
    handType: {
      isChoice: true,
    },
    playerOrder: [PLAYER_1, PLAYER_2, PLAYER_3],
    eldestHand: PLAYER_1,
    playersInGame: 3,
    tricksInHand: TRICKS_IN_3_PLAYER_GAME,
  };

  const inputChoice: GameTypeChoice = {
    gameType: GameType.TRUMP,
    trumpSuit: Suit.HEART,
  };

  const actual = getStatuteAfterChoice(inputStatute, inputChoice);

  expect(actual.eldestHand).toBe(PLAYER_1);
  expect(actual.handType.isChoice).toBeTruthy();
  expect(actual.handType.gameType.value).toBe(GameType.TRUMP);
  expect(actual.handType.gameType.trumpSuit).toBe(Suit.HEART);
  expect(actual.playerOrder).toStrictEqual([PLAYER_1, PLAYER_2, PLAYER_3]);
  expect(actual.tricksInHand).toBe(TRICKS_IN_3_PLAYER_GAME);
});

test('Ensure correct statute for misere game choice', () => {
  const inputStatute: HandStatute = {
    handType: {
      isChoice: true,
    },
    playerOrder: [PLAYER_2, PLAYER_3, PLAYER_1],
    eldestHand: PLAYER_2,
    playersInGame: 3,
    tricksInHand: TRICKS_IN_3_PLAYER_GAME,
  };

  const inputChoice: GameTypeChoice = {
    gameType: GameType.MISERE,
  };

  const actual = getStatuteAfterChoice(inputStatute, inputChoice);

  expect(actual.eldestHand).toBe(PLAYER_2);
  expect(actual.handType.isChoice).toBeTruthy();
  expect(actual.handType.gameType.value).toBe(GameType.MISERE);
  expect(actual.handType.gameType.trumpSuit).toBeUndefined();
  expect(actual.playerOrder).toStrictEqual([PLAYER_2, PLAYER_3, PLAYER_1]);
  expect(actual.tricksInHand).toBe(TRICKS_IN_3_PLAYER_GAME);
});
