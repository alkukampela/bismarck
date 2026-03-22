import { ErrorTypes } from '../types/error-types';
import { GameError } from '../utils/game-error';
import { initHand } from './hand-service';

// Mock dependencies as needed
jest.mock('./deck-operations', () => ({
  noCardsLeft: jest.fn(),
}));

import { noCardsLeft } from './deck-operations';

const PLAYER_0 = { name: 'Alice' };
const PLAYER_1 = { name: 'Bob' };
const PLAYER_2 = { name: 'Charlie' };
const PLAYER_3 = { name: 'Dave' };

describe('initHand', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultGameState = {
    handNumber: 1,
    players: [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
    trickScores: [],
    handStatute: {
      gameType: null,
      isChoice: false,
      playerOrder: [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
      eldestHand: PLAYER_0,
      tricksInHand: 8,
    },
  };

  describe('validations', () => {
    test('throws CURRENT_HAND_NOT_FINISHED when deck has cards', () => {
      (noCardsLeft as jest.Mock).mockReturnValue(false);
      const gameState = { ...defaultGameState };
      expect(() => initHand(gameState, [])).toThrow(
        new GameError(ErrorTypes.CURRENT_HAND_NOT_FINISHED)
      );
    });

    test('throws GAME_NOT_FOUND when gameState is undefined', () => {
      (noCardsLeft as jest.Mock).mockReturnValue(true);
      expect(() => initHand(undefined, [])).toThrow(
        new GameError(ErrorTypes.GAME_NOT_FOUND)
      );
    });

    test('throws GAME_ENDED when handNumber reaches limit (4 players)', () => {
      (noCardsLeft as jest.Mock).mockReturnValue(true);
      const gameState = { ...defaultGameState, handNumber: 16 };
      expect(() => initHand(gameState, [])).toThrow(
        new GameError(ErrorTypes.GAME_ENDED)
      );
    });

    test('throws GAME_ENDED when handNumber exceeds limit', () => {
      (noCardsLeft as jest.Mock).mockReturnValue(true);
      const gameState = { ...defaultGameState, handNumber: 17 };
      expect(() => initHand(gameState, [])).toThrow(
        new GameError(ErrorTypes.GAME_ENDED)
      );
    });
  });
});
