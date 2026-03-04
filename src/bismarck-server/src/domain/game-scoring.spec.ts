import { calculateTrickPoints, getTotalScores } from './game-scoring';
import { GameType } from '../../../types/game-type';
import { Player } from '../../../types/player';
import { PlayerScore } from '../../../types/player-score';
import { TrickScore } from '../../../types/trick-score';
import { GameState, Statute } from '../types/game-state';
import { HandStatute } from '../../../types/hand-statute';
import { SuitEnum } from '../../../types/suit';

const PLAYER_1: Player = { name: 'Aimo' };
const PLAYER_2: Player = { name: 'Börje' };
const PLAYER_3: Player = { name: 'Cunigunda' };
const PLAYER_4: Player = { name: 'Dieter' };

const createMockHandStatute = (
  gameType: GameType | null = GameType.TRUMP,
  isChoice = false
): Statute => ({
  playerOrder: [PLAYER_1, PLAYER_2, PLAYER_3],
  eldestHand: PLAYER_1,
  isChoice,
  gameType: gameType
    ? gameType === GameType.TRUMP
      ? { value: gameType, trumpSuit: SuitEnum.CLUB }
      : { value: gameType, trumpSuit: null }
    : null,
  tricksInHand: 12,
});

const createMockGameState = (
  trickScores: TrickScore[] = [],
  gameType: GameType = GameType.TRUMP,
  isChoice = false
): GameState => ({
  players: [PLAYER_1, PLAYER_2, PLAYER_3],
  handNumber: 0,
  handStatute: createMockHandStatute(gameType, isChoice),
  trickScores,
});

describe('calculateTrickPoints', () => {
  test('should calculate points for first trick with no previous scores', () => {
    const trickPoints: PlayerScore[] = [
      { player: PLAYER_1, score: 10 },
      { player: PLAYER_2, score: -4 },
      { player: PLAYER_3, score: -6 },
    ];
    const gameState = createMockGameState([]);

    const result = calculateTrickPoints(trickPoints, gameState);

    expect(result.scores).toEqual([
      { player: PLAYER_1, totalPoints: 10 },
      { player: PLAYER_2, totalPoints: -4 },
      { player: PLAYER_3, totalPoints: -6 },
    ]);
    expect(result.isChoice).toBe(false);
    expect(result.gameType).toBe(GameType.TRUMP);
  });

  test('should accumulate points correctly for subsequent tricks', () => {
    const previousTrickScore: TrickScore = {
      isChoice: false,
      gameType: GameType.TRUMP,
      scores: [
        { player: PLAYER_1, totalPoints: 10 },
        { player: PLAYER_2, totalPoints: -4 },
        { player: PLAYER_3, totalPoints: -6 },
      ],
    };

    const trickPoints: PlayerScore[] = [
      { player: PLAYER_1, score: 2 },
      { player: PLAYER_2, score: 5 },
      { player: PLAYER_3, score: -7 },
    ];

    const gameState = createMockGameState([previousTrickScore]);

    const result = calculateTrickPoints(trickPoints, gameState);

    expect(result.scores).toEqual([
      { player: PLAYER_1, totalPoints: 12 },
      { player: PLAYER_2, totalPoints: 1 },
      { player: PLAYER_3, totalPoints: -13 },
    ]);
  });

  test('should handle multiple previous trick scores correctly', () => {
    const trickScores: TrickScore[] = [
      {
        isChoice: false,
        gameType: GameType.TRUMP,
        scores: [
          { player: PLAYER_1, totalPoints: 5 },
          { player: PLAYER_2, totalPoints: -2 },
          { player: PLAYER_3, totalPoints: -3 },
        ],
      },
      {
        isChoice: false,
        gameType: GameType.TRUMP,
        scores: [
          { player: PLAYER_1, totalPoints: 10 },
          { player: PLAYER_2, totalPoints: -5 },
          { player: PLAYER_3, totalPoints: -5 },
        ],
      },
    ];

    const trickPoints: PlayerScore[] = [
      { player: PLAYER_1, score: 3 },
      { player: PLAYER_2, score: -1 },
      { player: PLAYER_3, score: -2 },
    ];

    const gameState = createMockGameState(trickScores);

    const result = calculateTrickPoints(trickPoints, gameState);

    expect(result.scores).toEqual([
      { player: PLAYER_1, totalPoints: 13 },
      { player: PLAYER_2, totalPoints: -6 },
      { player: PLAYER_3, totalPoints: -7 },
    ]);
  });

  test('should set isChoice correctly for choice games', () => {
    const trickPoints: PlayerScore[] = [
      { player: PLAYER_1, score: 6 },
      { player: PLAYER_2, score: -2 },
      { player: PLAYER_3, score: -4 },
    ];
    const gameState = createMockGameState([], GameType.NO_TRUMP, true);

    const result = calculateTrickPoints(trickPoints, gameState);

    expect(result.isChoice).toBe(true);
    expect(result.gameType).toBe(GameType.NO_TRUMP);
  });

  test('should throw error when game type is null', () => {
    const trickPoints: PlayerScore[] = [
      { player: PLAYER_1, score: 4 },
      { player: PLAYER_2, score: -1 },
      { player: PLAYER_3, score: -3 },
    ];
    const gameState: GameState = {
      players: [PLAYER_1, PLAYER_2, PLAYER_3],
      handNumber: 0,
      handStatute: {
        gameType: null,
        isChoice: true,
        playerOrder: [PLAYER_1, PLAYER_2, PLAYER_3],
        eldestHand: PLAYER_1,
        tricksInHand: 0,
      },
      trickScores: [],
    };

    expect(() => calculateTrickPoints(trickPoints, gameState)).toThrow(
      'Unexpected error'
    );
  });

  test('should handle different game types correctly', () => {
    const trickPoints: PlayerScore[] = [
      { player: PLAYER_1, score: 8 },
      { player: PLAYER_2, score: -3 },
      { player: PLAYER_3, score: -5 },
    ];
    const gameState = createMockGameState([], GameType.MISERE);

    const result = calculateTrickPoints(trickPoints, gameState);

    expect(result.gameType).toBe(GameType.MISERE);
  });
});

describe('getTotalScores', () => {
  test('should return isFinished as false for empty trick scores', () => {
    const gameState = createMockGameState([]);

    const result = getTotalScores(gameState);

    expect(result.isFinished).toBe(false);
    expect(result.trickScores).toEqual([]);
  });

  test('should return isFinished as false for incomplete 3-player game', () => {
    const trickScores: TrickScore[] = Array(15).fill({
      isChoice: false,
      gameType: GameType.TRUMP,
      scores: [
        { player: PLAYER_1, totalPoints: 10 },
        { player: PLAYER_2, totalPoints: -5 },
        { player: PLAYER_3, totalPoints: -5 },
      ],
    });
    const gameState = createMockGameState(trickScores);

    const result = getTotalScores(gameState);

    expect(result.isFinished).toBe(false);
  });

  test('should return isFinished as false for incomplete 4-player game', () => {
    const trickScores: TrickScore[] = Array(11).fill({
      isChoice: false,
      gameType: GameType.TRUMP,
      scores: [
        { player: PLAYER_1, totalPoints: 12 },
        { player: PLAYER_2, totalPoints: -6 },
        { player: PLAYER_3, totalPoints: -5 },
        { player: PLAYER_4, totalPoints: -1 },
      ],
    });
    const gameState = createMockGameState(trickScores);

    const result = getTotalScores(gameState);

    expect(result.isFinished).toBe(false);
  });

  test('should return isFinished as true for complete 4-player game', () => {
    const trickScores: TrickScore[] = Array(12).fill({
      isChoice: false,
      gameType: GameType.TRUMP,
      scores: [
        { player: PLAYER_1, totalPoints: 12 },
        { player: PLAYER_2, totalPoints: -6 },
        { player: PLAYER_3, totalPoints: -5 },
        { player: PLAYER_4, totalPoints: -1 },
      ],
    });
    const gameState = createMockGameState(trickScores);

    const result = getTotalScores(gameState);

    expect(result.isFinished).toBe(true);
    expect(result.trickScores.length).toBe(12);
  });

  test('should return isFinished as true for complete 3-player game', () => {
    const threePlayers = [PLAYER_1, PLAYER_2, PLAYER_3];
    const trickScores: TrickScore[] = Array(16).fill({
      isChoice: false,
      gameType: GameType.TRUMP,
      scores: [
        { player: PLAYER_1, totalPoints: 8 },
        { player: PLAYER_2, totalPoints: -3 },
        { player: PLAYER_3, totalPoints: -5 },
      ],
    });
    const gameState: GameState = {
      players: threePlayers,
      handNumber: 0,
      handStatute: {
        ...createMockHandStatute(GameType.TRUMP, false),
        playerOrder: threePlayers,
      },
      trickScores,
    };

    const result = getTotalScores(gameState);

    expect(result.isFinished).toBe(true);
    expect(result.trickScores.length).toBe(16);
  });

  test('should return isFinished as true for games with more than required tricks', () => {
    const trickScores: TrickScore[] = Array(20).fill({
      isChoice: false,
      gameType: GameType.TRUMP,
      scores: [
        { player: PLAYER_1, totalPoints: 15 },
        { player: PLAYER_2, totalPoints: -8 },
        { player: PLAYER_3, totalPoints: -7 },
      ],
    });
    const gameState = createMockGameState(trickScores);

    const result = getTotalScores(gameState);

    expect(result.isFinished).toBe(true);
  });

  test('should return all trick scores correctly', () => {
    const trickScores: TrickScore[] = [
      {
        isChoice: false,
        gameType: GameType.TRUMP,
        scores: [
          { player: PLAYER_1, totalPoints: 6 },
          { player: PLAYER_2, totalPoints: -2 },
          { player: PLAYER_3, totalPoints: -4 },
        ],
      },
      {
        isChoice: false,
        gameType: GameType.NO_TRUMP,
        scores: [
          { player: PLAYER_1, totalPoints: 10 },
          { player: PLAYER_2, totalPoints: -4 },
          { player: PLAYER_3, totalPoints: -6 },
        ],
      },
    ];
    const gameState = createMockGameState(trickScores);

    const result = getTotalScores(gameState);

    expect(result.trickScores).toEqual(trickScores);
    expect(result.trickScores.length).toBe(2);
  });
});
