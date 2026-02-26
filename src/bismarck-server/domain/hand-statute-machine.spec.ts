import { Game } from '../../types/game';
import { GameType } from '../../types/game-type';
import { FullGameType, HandStatute } from '../../types/hand-statute';
import { Player } from '../../types/player';
import { SuitEnum } from '../../types/suit';
import {
  buildHandStatute,
  getStatuteAfterChoice,
} from './hand-statute-machine';

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

  const actual = buildHandStatute(inputGame, SuitEnum.DIAMOND);

  expect(actual.eldestHand).toBe(PLAYER_2);
  expect(actual.isChoice).toBeFalsy();
  expect(actual.gameType).toEqual({
    value: GameType.TRUMP,
    trumpSuit: SuitEnum.DIAMOND,
  });
  expect(actual.playerOrder).toStrictEqual([PLAYER_2, PLAYER_3, PLAYER_1]);
  expect(actual.tricksInHand).toBe(TRICKS_IN_3_PLAYER_GAME);
});

test('Ensure correct statute for first no trump hand', () => {
  const inputGame: Game = { ...initGame(), handNumber: 3 };

  const actual = buildHandStatute(inputGame, null);

  expect(actual.eldestHand).toBe(PLAYER_1);
  expect(actual.isChoice).toBeFalsy();
  expect(actual.gameType).toEqual({
    value: GameType.NO_TRUMP,
  });
  expect(actual.playerOrder).toStrictEqual([PLAYER_1, PLAYER_2, PLAYER_3]);
  expect(actual.tricksInHand).toBe(TRICKS_IN_3_PLAYER_GAME);
});

test('Ensure correct statute for third misere hand', () => {
  const inputGame: Game = { ...initGame(), handNumber: 8 };

  const actual = buildHandStatute(inputGame, null);

  expect(actual.eldestHand).toBe(PLAYER_3);
  expect(actual.isChoice).toBeFalsy();
  expect(actual.gameType).toEqual({
    value: GameType.MISERE,
  });
  expect(actual.playerOrder).toStrictEqual([PLAYER_3, PLAYER_1, PLAYER_2]);
  expect(actual.tricksInHand).toBe(TRICKS_IN_3_PLAYER_GAME);
});

test('Ensure correct statute for first choice game', () => {
  const inputGame: Game = { ...initGame(), handNumber: 9 };

  const actual = buildHandStatute(inputGame, null);

  expect(actual.eldestHand).toBe(PLAYER_1);
  expect(actual.isChoice).toBeTruthy();
  expect(actual.gameType).toBeUndefined();
  expect(actual.playerOrder).toStrictEqual([PLAYER_1, PLAYER_2, PLAYER_3]);
  expect(actual.tricksInHand).toBe(TRICKS_IN_3_PLAYER_GAME);
});

test('Ensure correct statute for trump game choice', () => {
  const inputStatute: HandStatute = {
    gameType: undefined,
    isChoice: true,
    playerOrder: [PLAYER_1, PLAYER_2, PLAYER_3],
    eldestHand: PLAYER_1,
    playersInGame: 3,
    tricksInHand: TRICKS_IN_3_PLAYER_GAME,
  };

  const inputChoice: FullGameType = {
    value: GameType.TRUMP,
    trumpSuit: SuitEnum.HEART,
  };

  const actual = getStatuteAfterChoice(inputStatute, inputChoice);

  expect(actual.eldestHand).toBe(PLAYER_1);
  expect(actual.isChoice).toBeTruthy();
  expect(actual.gameType?.value).toBe(GameType.TRUMP);
  expect(actual.gameType?.trumpSuit).toBe(SuitEnum.HEART);
  expect(actual.playerOrder).toStrictEqual([PLAYER_1, PLAYER_2, PLAYER_3]);
  expect(actual.tricksInHand).toBe(TRICKS_IN_3_PLAYER_GAME);
});

test('Ensure correct statute for misere game choice', () => {
  const inputStatute: HandStatute = {
    gameType: undefined,
    isChoice: true,
    playerOrder: [PLAYER_2, PLAYER_3, PLAYER_1],
    eldestHand: PLAYER_2,
    playersInGame: 3,
    tricksInHand: TRICKS_IN_3_PLAYER_GAME,
  };

  const inputChoice: FullGameType = {
    value: GameType.MISERE,
  };

  const actual = getStatuteAfterChoice(inputStatute, inputChoice);

  expect(actual.eldestHand).toBe(PLAYER_2);
  expect(actual.isChoice).toBeTruthy();
  expect(actual.gameType?.value).toBe(GameType.MISERE);
  expect(actual.gameType?.trumpSuit).toBeUndefined();
  expect(actual.playerOrder).toStrictEqual([PLAYER_2, PLAYER_3, PLAYER_1]);
  expect(actual.tricksInHand).toBe(TRICKS_IN_3_PLAYER_GAME);
});
