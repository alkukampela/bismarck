import { chooseGameType } from './hand-service';
import { ErrorTypes } from '../types/error-types';
import { GameType } from '../../../types/game-type';
import { Player } from '../../../types/player';
import { SuitEnum } from '../../../types/suit';
import * as handStatuteMachine from './hand-statute-machine';
import * as trickMachine from './trick-machine';

jest.mock('./hand-statute-machine', () => ({
  getStatuteAfterChoice: jest.fn(),
  toHandStatute: jest.fn(),
}));
jest.mock('./trick-machine', () => ({
  emptyTrickResponse: jest.fn(),
}));

// Test Fixtures
const ELDEST_HAND: Player = { name: 'Moritz' };
const NOT_ELDEST_HAND: Player = { name: 'Wolfgang' };

const createGameState = (eldest: Player, notEldest: Player, gameType: any) => ({
  players: [eldest, notEldest],
  handNumber: 1,
  handStatute: {
    gameType,
    isChoice: true,
    playerOrder: [eldest, notEldest],
    eldestHand: eldest,
    tricksInHand: 8,
  },
  trickScores: [],
});

describe('chooseGameType', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Use direct imports for mocks

  const mockGetStatuteAfterChoice =
    handStatuteMachine.getStatuteAfterChoice as jest.Mock;
  const mockToHandStatute = handStatuteMachine.toHandStatute as jest.Mock;
  const mockEmptyTrickResponse = trickMachine.emptyTrickResponse as jest.Mock;

  test('throws GAME_NOT_FOUND when gameState is undefined', () => {
    try {
      chooseGameType(ELDEST_HAND, { gameType: GameType.NO_TRUMP }, undefined);
      fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error).toMatchObject({
        errorType: ErrorTypes.GAME_NOT_FOUND,
        message: ErrorTypes.GAME_NOT_FOUND,
      });
    }
  });

  test('throws MUST_BE_ELDEST_HAND when player is not eldest hand', () => {
    const gameState = createGameState(ELDEST_HAND, NOT_ELDEST_HAND, null);
    try {
      chooseGameType(
        NOT_ELDEST_HAND,
        { gameType: GameType.NO_TRUMP },
        gameState
      );
      fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error).toMatchObject({
        errorType: ErrorTypes.MUST_BE_ELDEST_HAND,
        message: ErrorTypes.MUST_BE_ELDEST_HAND,
      });
    }
  });

  test('throws GAME_TYPE_CHOSEN when gameType already exists', () => {
    const gameState = createGameState(ELDEST_HAND, NOT_ELDEST_HAND, {
      value: GameType.NO_TRUMP,
      trumpSuit: null,
    });
    try {
      chooseGameType(ELDEST_HAND, { gameType: GameType.NO_TRUMP }, gameState);
      fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error).toMatchObject({
        errorType: ErrorTypes.GAME_TYPE_CHOSEN,
        message: ErrorTypes.GAME_TYPE_CHOSEN,
      });
    }
  });

  test('throws ILLEGAL_CHOICE when choosing TRUMP without trumpSuit', () => {
    const gameState = createGameState(ELDEST_HAND, NOT_ELDEST_HAND, null);
    try {
      chooseGameType(ELDEST_HAND, { gameType: GameType.TRUMP }, gameState);
      fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error).toMatchObject({
        errorType: ErrorTypes.ILLEGAL_CHOICE,
        message: ErrorTypes.ILLEGAL_CHOICE,
      });
    }
  });

  test('successfully chooses TRUMP with a valid suit', () => {
    const gameState = createGameState(ELDEST_HAND, NOT_ELDEST_HAND, null);
    const gameTypeChoice = {
      gameType: GameType.TRUMP,
      trumpSuit: SuitEnum.HEART,
    };
    const updatedStatute = {
      ...gameState.handStatute,
      gameType: {
        value: GameType.TRUMP,
        trumpSuit: SuitEnum.HEART,
      },
    };
    const statuteResponse = { mock: 'statuteResponse' };
    const trickResponse = { mock: 'trickResponse' };

    mockGetStatuteAfterChoice.mockReturnValue(updatedStatute);
    mockToHandStatute.mockReturnValue(statuteResponse);
    mockEmptyTrickResponse.mockReturnValue(trickResponse);

    const result = chooseGameType(ELDEST_HAND, gameTypeChoice, gameState);

    expect(mockGetStatuteAfterChoice).toHaveBeenCalledWith(
      gameState.handStatute,
      {
        value: GameType.TRUMP,
        trumpSuit: SuitEnum.HEART,
      }
    );
    expect(mockToHandStatute).toHaveBeenCalledWith(updatedStatute);
    expect(mockEmptyTrickResponse).toHaveBeenCalledWith(
      gameState.handStatute.playerOrder
    );
    expect(result).toEqual({
      updates: { state: { ...gameState, handStatute: updatedStatute } },
      retval: statuteResponse,
      broadcastValue: trickResponse,
    });
  });

  test('successfully chooses NO_TRUMP', () => {
    const gameState = createGameState(ELDEST_HAND, NOT_ELDEST_HAND, null);
    const gameTypeChoice = { gameType: GameType.NO_TRUMP };
    const updatedStatute = {
      ...gameState.handStatute,
      gameType: { value: GameType.NO_TRUMP, trumpSuit: null },
    };
    const statuteResponse = { mock: 'statuteResponse' };
    const trickResponse = { mock: 'trickResponse' };

    mockGetStatuteAfterChoice.mockReturnValue(updatedStatute);
    mockToHandStatute.mockReturnValue(statuteResponse);
    mockEmptyTrickResponse.mockReturnValue(trickResponse);

    const result = chooseGameType(ELDEST_HAND, gameTypeChoice, gameState);

    expect(mockGetStatuteAfterChoice).toHaveBeenCalledWith(
      gameState.handStatute,
      { value: GameType.NO_TRUMP, trumpSuit: null }
    );
    expect(mockToHandStatute).toHaveBeenCalledWith(updatedStatute);
    expect(mockEmptyTrickResponse).toHaveBeenCalledWith(
      gameState.handStatute.playerOrder
    );
    expect(result).toEqual({
      updates: { state: { ...gameState, handStatute: updatedStatute } },
      retval: statuteResponse,
      broadcastValue: trickResponse,
    });
  });

  test('successfully chooses MISERE', () => {
    const gameState = createGameState(ELDEST_HAND, NOT_ELDEST_HAND, null);
    const gameTypeChoice = { gameType: GameType.MISERE };
    const updatedStatute = {
      ...gameState.handStatute,
      gameType: { value: GameType.MISERE, trumpSuit: null },
    };
    const statuteResponse = { mock: 'statuteResponse' };
    const trickResponse = { mock: 'trickResponse' };

    mockGetStatuteAfterChoice.mockReturnValue(updatedStatute);
    mockToHandStatute.mockReturnValue(statuteResponse);
    mockEmptyTrickResponse.mockReturnValue(trickResponse);

    const result = chooseGameType(ELDEST_HAND, gameTypeChoice, gameState);

    expect(mockGetStatuteAfterChoice).toHaveBeenCalledWith(
      gameState.handStatute,
      { value: GameType.MISERE, trumpSuit: null }
    );
    expect(mockToHandStatute).toHaveBeenCalledWith(updatedStatute);
    expect(mockEmptyTrickResponse).toHaveBeenCalledWith(
      gameState.handStatute.playerOrder
    );
    expect(result).toEqual({
      updates: { state: { ...gameState, handStatute: updatedStatute } },
      retval: statuteResponse,
      broadcastValue: trickResponse,
    });
  });

  test('works when gameType is null initially', () => {
    const gameState = createGameState(ELDEST_HAND, NOT_ELDEST_HAND, null);
    const gameTypeChoice = { gameType: GameType.NO_TRUMP };
    const updatedStatute = {
      ...gameState.handStatute,
      gameType: { value: GameType.NO_TRUMP, trumpSuit: null },
    };
    const statuteResponse = { mock: 'statuteResponse' };
    const trickResponse = { mock: 'trickResponse' };

    mockGetStatuteAfterChoice.mockReturnValue(updatedStatute);
    mockToHandStatute.mockReturnValue(statuteResponse);
    mockEmptyTrickResponse.mockReturnValue(trickResponse);

    const result = chooseGameType(ELDEST_HAND, gameTypeChoice, gameState);

    expect(result).toEqual({
      updates: { state: { ...gameState, handStatute: updatedStatute } },
      retval: statuteResponse,
      broadcastValue: trickResponse,
    });
  });

  test('throws GAME_TYPE_CHOSEN when gameType already exists', () => {
    const gameState = createGameState(ELDEST_HAND, NOT_ELDEST_HAND, {
      value: GameType.NO_TRUMP,
      trumpSuit: null,
    });
    try {
      chooseGameType(ELDEST_HAND, { gameType: GameType.NO_TRUMP }, gameState);
      fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error).toMatchObject({
        errorType: ErrorTypes.GAME_TYPE_CHOSEN,
        message: ErrorTypes.GAME_TYPE_CHOSEN,
      });
    }
  });

  test('throws ILLEGAL_CHOICE when choosing TRUMP without trumpSuit', () => {
    const gameState = createGameState(ELDEST_HAND, NOT_ELDEST_HAND, null);
    try {
      chooseGameType(ELDEST_HAND, { gameType: GameType.TRUMP }, gameState);
      fail('Expected error was not thrown');
    } catch (error: any) {
      expect(error).toMatchObject({
        errorType: ErrorTypes.ILLEGAL_CHOICE,
        message: ErrorTypes.ILLEGAL_CHOICE,
      });
    }
  });
});
