import { addCardToTrick } from './hand-service';
import { Player } from '../../../types/player';
import { GameState, GameTypeData } from '../types/game-state';
import { CardContainer } from '../types/card-container';
import { Card, Rank, Suit } from '../../../types/card';
import { GameType } from '../../../types/game-type';
import { SuitEnum } from '../../../types/suit';
import { Trick } from '../types/trick';
import { PlayerScore } from '../../../types/player-score';
import { TrickScore } from '../../../types/trick-score';
import { TrickResponse } from '../../../types/trick-response';
import { ErrorTypes } from '../types/error-types';
import { GameError } from '../utils/game-error';
import * as deckOperations from './deck-operations';
import * as trickMachine from './trick-machine';
import * as handScoreCalculator from './hand-score-calculator';
import * as gameScoring from './game-scoring';

jest.mock('./deck-operations', () => ({
  ...jest.requireActual('./deck-operations'),
  getPlayersCards: jest.fn(),
  extraCardsAmount: jest.fn(),
  hasPlayerCard: jest.fn(),
  hasPlayerCardOfSuit: jest.fn(),
  removeCard: jest.fn(),
  noCardsLeft: jest.fn(),
}));

jest.mock('./trick-machine', () => ({
  ...jest.requireActual('./trick-machine'),
  hasPlayerTurn: jest.fn(),
  playCard: jest.fn(),
  isTrickReady: jest.fn(),
  getTaker: jest.fn(),
  convertToTrickResponse: jest.fn(),
}));

jest.mock('./hand-score-calculator', () => ({
  ...jest.requireActual('./hand-score-calculator'),
  updatedTrickScore: jest.fn(),
  getHandsPoints: jest.fn(),
}));

jest.mock('./game-scoring', () => ({
  ...jest.requireActual('./game-scoring'),
  calculateTrickPoints: jest.fn(),
}));

// Test Fixtures
const PLAYER_0: Player = { name: 'Arnold' };
const PLAYER_1: Player = { name: 'Betsie' };
const PLAYER_2: Player = { name: 'Cordelia' };
const PLAYER_3: Player = { name: 'Derward' };

const createGameState = (
  players: Player[],
  isChoice: boolean,
  gameType: GameTypeData | null
): GameState => ({
  players,
  handNumber: 1,
  handStatute: {
    gameType: gameType,
    isChoice,
    playerOrder: players,
    eldestHand: players[0],
    tricksInHand: Math.floor((52 - 2) / players.length),
  },
  trickScores: [],
});

const createMockCard = (suit: Suit, rank: Rank): Card => ({
  rank,
  suit,
});

const createMockDeck = (): CardContainer[] => {
  return [
    { card: createMockCard('♥️', '10'), isPlayed: false },
    { card: createMockCard('♠️', 'A'), isPlayed: false },
  ];
};

describe('addCardToTrick', () => {
  // Mock function references
  let mockHasPlayerTurn: jest.MockedFunction<typeof trickMachine.hasPlayerTurn>;
  let mockHasPlayerCard: jest.MockedFunction<
    typeof deckOperations.hasPlayerCard
  >;
  let mockPlayerHasCardsOfSuit: jest.MockedFunction<
    typeof deckOperations.hasPlayerCardOfSuit
  >;
  let mockPlayCard: jest.MockedFunction<typeof trickMachine.playCard>;
  let mockRemoveCard: jest.MockedFunction<typeof deckOperations.removeCard>;
  let mockIsTrickReady: jest.MockedFunction<typeof trickMachine.isTrickReady>;
  let mockGetTaker: jest.MockedFunction<typeof trickMachine.getTaker>;
  let mockUpdatedTrickScore: jest.MockedFunction<
    typeof handScoreCalculator.updatedTrickScore
  >;
  let mockNoCardsLeft: jest.MockedFunction<typeof deckOperations.noCardsLeft>;
  let mockGetHandsPoints: jest.MockedFunction<
    typeof handScoreCalculator.getHandsPoints
  >;
  let mockCalculateTrickPoints: jest.MockedFunction<
    typeof gameScoring.calculateTrickPoints
  >;
  let mockConvertToTrickResponse: jest.MockedFunction<
    typeof trickMachine.convertToTrickResponse
  >;

  // Test fixtures
  const createTrick = (cardCount: number = 2): Trick => ({
    trickSuit: SuitEnum.HEART,
    trumpSuit: SuitEnum.SPADE,
    trickCards: Array.from({ length: cardCount }, (_, i) => ({
      player: [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3][i],
      card: createMockCard('♥️', '10'),
    })),
    trickNumber: 1,
  });

  const createPlayerScores = (): PlayerScore[] => [
    { player: PLAYER_0, score: 5 },
    { player: PLAYER_1, score: 3 },
    { player: PLAYER_2, score: 2 },
    { player: PLAYER_3, score: 0 },
  ];

  beforeEach(() => {
    mockHasPlayerTurn = trickMachine.hasPlayerTurn as jest.MockedFunction<
      typeof trickMachine.hasPlayerTurn
    >;
    mockHasPlayerCard = deckOperations.hasPlayerCard as jest.MockedFunction<
      typeof deckOperations.hasPlayerCard
    >;
    mockPlayerHasCardsOfSuit =
      deckOperations.hasPlayerCardOfSuit as jest.MockedFunction<
        typeof deckOperations.hasPlayerCardOfSuit
      >;
    mockPlayCard = trickMachine.playCard as jest.MockedFunction<
      typeof trickMachine.playCard
    >;
    mockRemoveCard = deckOperations.removeCard as jest.MockedFunction<
      typeof deckOperations.removeCard
    >;
    mockIsTrickReady = trickMachine.isTrickReady as jest.MockedFunction<
      typeof trickMachine.isTrickReady
    >;
    mockGetTaker = trickMachine.getTaker as jest.MockedFunction<
      typeof trickMachine.getTaker
    >;
    mockUpdatedTrickScore =
      handScoreCalculator.updatedTrickScore as jest.MockedFunction<
        typeof handScoreCalculator.updatedTrickScore
      >;
    mockNoCardsLeft = deckOperations.noCardsLeft as jest.MockedFunction<
      typeof deckOperations.noCardsLeft
    >;
    mockGetHandsPoints =
      handScoreCalculator.getHandsPoints as jest.MockedFunction<
        typeof handScoreCalculator.getHandsPoints
      >;
    mockCalculateTrickPoints =
      gameScoring.calculateTrickPoints as jest.MockedFunction<
        typeof gameScoring.calculateTrickPoints
      >;
    mockConvertToTrickResponse =
      trickMachine.convertToTrickResponse as jest.MockedFunction<
        typeof trickMachine.convertToTrickResponse
      >;

    jest.clearAllMocks();
  });

  describe('Error Cases - Trick Validation', () => {
    test('throws TRICK_NOT_FOUND when trick is undefined', () => {
      const player = PLAYER_0;
      const card = createMockCard('♥️', 'K');
      const gameState = createGameState(
        [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
        false,
        { value: GameType.NO_TRUMP, trumpSuit: null }
      );
      const deck = createMockDeck();

      expect(() =>
        addCardToTrick(player, card, gameState, undefined, deck, undefined)
      ).toThrow(new GameError(ErrorTypes.TRICK_NOT_FOUND));
    });

    test('throws TRICK_NOT_STARTED when trick has no cards', () => {
      const player = PLAYER_0;
      const card = createMockCard('♥️', 'K');
      const gameState = createGameState(
        [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
        false,
        { value: GameType.NO_TRUMP, trumpSuit: null }
      );
      const deck = createMockDeck();
      const trick = createTrick(0); // Empty trick

      expect(() =>
        addCardToTrick(player, card, gameState, trick, deck, undefined)
      ).toThrow(new GameError(ErrorTypes.TRICK_NOT_STARTED));
    });

    test("throws OTHER_PLAYER_HAS_TURN when not player's turn", () => {
      const player = PLAYER_0;
      const card = createMockCard('♥️', 'K');
      const gameState = createGameState(
        [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
        false,
        { value: GameType.NO_TRUMP, trumpSuit: null }
      );
      const deck = createMockDeck();
      const trick = createTrick(2);

      mockHasPlayerTurn.mockReturnValue(false);

      expect(() =>
        addCardToTrick(player, card, gameState, trick, deck, undefined)
      ).toThrow(new GameError(ErrorTypes.OTHER_PLAYER_HAS_TURN));

      expect(mockHasPlayerTurn).toHaveBeenCalledWith(trick, player);
    });
  });

  describe('Error Cases - Game State Validation', () => {
    test('throws GAME_NOT_FOUND when gameState is undefined', () => {
      const player = PLAYER_0;
      const card = createMockCard('♥️', 'K');
      const deck = createMockDeck();
      const trick = createTrick(2);

      mockHasPlayerTurn.mockReturnValue(true);

      expect(() =>
        addCardToTrick(player, card, undefined, trick, deck, undefined)
      ).toThrow(new GameError(ErrorTypes.GAME_NOT_FOUND));

      expect(mockHasPlayerTurn).toHaveBeenCalledWith(trick, player);
    });
  });

  describe('Error Cases - Card Validation', () => {
    test("throws CARD_NOT_FOUND when player doesn't have card", () => {
      const player = PLAYER_1; // index 1
      const card = createMockCard('♥️', 'K');
      const gameState = createGameState(
        [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
        false,
        { value: GameType.NO_TRUMP, trumpSuit: null }
      );
      const deck = createMockDeck();
      const trick = createTrick(2);

      mockHasPlayerTurn.mockReturnValue(true);
      mockHasPlayerCard.mockReturnValue(false);

      expect(() =>
        addCardToTrick(player, card, gameState, trick, deck, undefined)
      ).toThrow(new GameError(ErrorTypes.CARD_NOT_FOUND));

      expect(mockHasPlayerCard).toHaveBeenCalledWith(1, 4, card, deck);
    });

    test('throws MUST_FOLLOW_SUIT_AND_TRUMP when move is illegal', () => {
      const player = PLAYER_1;
      const card = createMockCard('♠️', 'K');
      const gameState = createGameState(
        [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
        false,
        { value: GameType.TRUMP, trumpSuit: SuitEnum.SPADE }
      );
      const deck = createMockDeck();
      const trick = createTrick(2); // Trick suit is hearts

      mockHasPlayerTurn.mockReturnValue(true);
      mockHasPlayerCard.mockReturnValue(true);
      mockPlayerHasCardsOfSuit.mockReturnValue(true);

      // We need cards in the deck that make the move illegal
      expect(() =>
        addCardToTrick(player, card, gameState, trick, deck, undefined)
      ).toThrow(new GameError(ErrorTypes.MUST_FOLLOW_SUIT_AND_TRUMP));
    });
  });

  describe('Happy Path - Normal Card Play (Trick Continues)', () => {
    test('successfully adds card to incomplete trick', () => {
      const player = PLAYER_2; // index 2
      const card = createMockCard('♥️', 'K');
      const gameState = createGameState(
        [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
        false,
        { value: GameType.NO_TRUMP, trumpSuit: null }
      );
      const deck = createMockDeck();
      const trick = createTrick(2); // 2 cards, not complete
      const updatedTrick = {
        ...trick,
        trickCards: [...trick.trickCards, { player, card }],
      };
      const updatedDeck = [
        { card: createMockCard('♠️', 'A'), isPlayed: false },
      ];
      const trickResponse: TrickResponse = {
        cards: [],
        trickNumber: 1,
        trickStatus: 'UNFINISHED',
      };

      mockHasPlayerTurn.mockReturnValue(true);
      mockHasPlayerCard.mockReturnValue(true);
      mockPlayCard.mockReturnValue(updatedTrick);
      mockRemoveCard.mockReturnValue(updatedDeck);
      mockIsTrickReady.mockReturnValue(false);
      mockConvertToTrickResponse.mockReturnValue(trickResponse);

      const result = addCardToTrick(
        player,
        card,
        gameState,
        trick,
        deck,
        undefined
      );

      expect(mockHasPlayerTurn).toHaveBeenCalledWith(trick, player);
      expect(mockHasPlayerCard).toHaveBeenCalledWith(2, 4, card, deck);
      expect(mockPlayCard).toHaveBeenCalledWith(trick, player, card);
      expect(mockRemoveCard).toHaveBeenCalledWith(card, deck);
      expect(mockIsTrickReady).toHaveBeenCalledWith(updatedTrick);
      expect(mockUpdatedTrickScore).not.toHaveBeenCalled();
      expect(mockGetHandsPoints).not.toHaveBeenCalled();
      expect(mockCalculateTrickPoints).not.toHaveBeenCalled();
      expect(mockConvertToTrickResponse).toHaveBeenCalledWith(updatedTrick);

      expect(result).toEqual({
        updates: {
          trickPoints: undefined,
          state: undefined,
          deck: updatedDeck,
          trick: updatedTrick,
        },
        retval: trickResponse,
        broadcastValue: trickResponse,
      });
    });
  });

  describe('Happy Path - Trick Completion (Hand Continues)', () => {
    test('updates scores when trick is completed', () => {
      const player = PLAYER_3;
      const card = createMockCard('♥️', 'K');
      const gameState = createGameState(
        [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
        false,
        { value: GameType.NO_TRUMP, trumpSuit: null }
      );
      const deck = createMockDeck();
      const trick = createTrick(3); // 3 cards, one more makes it complete
      const updatedTrick = {
        ...trick,
        trickCards: [...trick.trickCards, { player, card }],
      };
      const updatedDeck = [
        { card: createMockCard('♠️', 'A'), isPlayed: false },
      ];
      const playerScoresBefore = createPlayerScores();
      const newScores: PlayerScore[] = [
        { player: PLAYER_0, score: 6 },
        { player: PLAYER_1, score: 3 },
        { player: PLAYER_2, score: 2 },
        { player: PLAYER_3, score: 0 },
      ];
      const trickResponse: TrickResponse = {
        cards: [],
        trickNumber: 1,
        trickStatus: 'UNFINISHED',
      };

      mockHasPlayerTurn.mockReturnValue(true);
      mockHasPlayerCard.mockReturnValue(true);
      mockPlayCard.mockReturnValue(updatedTrick);
      mockRemoveCard.mockReturnValue(updatedDeck);
      mockIsTrickReady.mockReturnValue(true);
      mockGetTaker.mockReturnValue(PLAYER_0);
      mockUpdatedTrickScore.mockReturnValue(newScores);
      mockNoCardsLeft.mockReturnValue(false);
      mockConvertToTrickResponse.mockReturnValue(trickResponse);

      const result = addCardToTrick(
        player,
        card,
        gameState,
        trick,
        deck,
        playerScoresBefore
      );

      expect(mockIsTrickReady).toHaveBeenCalledWith(updatedTrick);
      expect(mockGetTaker).toHaveBeenCalledWith(updatedTrick);
      expect(mockUpdatedTrickScore).toHaveBeenCalledWith(
        PLAYER_0,
        playerScoresBefore
      );
      expect(mockNoCardsLeft).toHaveBeenCalledWith(updatedDeck);
      expect(mockGetHandsPoints).not.toHaveBeenCalled();
      expect(mockCalculateTrickPoints).not.toHaveBeenCalled();

      expect(result).toEqual({
        updates: {
          trickPoints: newScores,
          state: undefined,
          deck: updatedDeck,
          trick: updatedTrick,
        },
        retval: trickResponse,
        broadcastValue: trickResponse,
      });
    });
  });

  describe('Happy Path - Hand Completion (Last Card)', () => {
    test('completes hand when last card is played', () => {
      const player = PLAYER_3;
      const card = createMockCard('♥️', 'K');

      const existingScores = [
        { player: PLAYER_0, score: 10 },
        { player: PLAYER_1, score: 8 },
      ];
      const existingTrickScore: TrickScore = {
        gameType: GameType.TRUMP,
        isChoice: false,
        scores: existingScores.map((s) => ({
          player: s.player,
          totalPoints: s.score,
        })),
      };
      const gameState = createGameState(
        [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
        false,
        { value: GameType.TRUMP, trumpSuit: SuitEnum.SPADE }
      );
      gameState.trickScores = [existingTrickScore];

      const deck = createMockDeck();
      const trick = createTrick(3);
      const updatedTrick = {
        ...trick,
        trickCards: [...trick.trickCards, { player, card }],
      };
      const updatedDeck: CardContainer[] = [];
      const playerScoresBefore = createPlayerScores();
      const finalTrickScores: PlayerScore[] = [
        { player: PLAYER_0, score: 6 },
        { player: PLAYER_1, score: 3 },
        { player: PLAYER_2, score: 2 },
        { player: PLAYER_3, score: 1 },
      ];
      const handScore: PlayerScore[] = [
        { player: PLAYER_0, score: 12 },
        { player: PLAYER_1, score: 6 },
        { player: PLAYER_2, score: 4 },
        { player: PLAYER_3, score: 2 },
      ];
      const currentTrickPoints: PlayerScore[] = [
        { player: PLAYER_0, score: 2 },
        { player: PLAYER_1, score: 1 },
        { player: PLAYER_2, score: 1 },
        { player: PLAYER_3, score: 0 },
      ];
      const currentTrickScore: TrickScore = {
        gameType: GameType.TRUMP,
        isChoice: false,
        scores: currentTrickPoints.map((s) => ({
          player: s.player,
          totalPoints: s.score,
        })),
      };
      const trickResponse: TrickResponse = {
        cards: [],
        trickNumber: 1,
        trickStatus: 'UNFINISHED',
      };

      mockHasPlayerTurn.mockReturnValue(true);
      mockHasPlayerCard.mockReturnValue(true);
      mockPlayCard.mockReturnValue(updatedTrick);
      mockRemoveCard.mockReturnValue(updatedDeck);
      mockIsTrickReady.mockReturnValue(true);
      mockGetTaker.mockReturnValue(PLAYER_0);
      mockUpdatedTrickScore.mockReturnValue(finalTrickScores);
      mockNoCardsLeft.mockReturnValue(true);
      mockGetHandsPoints.mockReturnValue(handScore);
      mockCalculateTrickPoints.mockReturnValue(currentTrickScore);
      mockConvertToTrickResponse.mockReturnValue(trickResponse);

      const result = addCardToTrick(
        player,
        card,
        gameState,
        trick,
        deck,
        playerScoresBefore
      );

      expect(mockGetHandsPoints).toHaveBeenCalledWith(
        finalTrickScores,
        GameType.TRUMP
      );
      expect(mockCalculateTrickPoints).toHaveBeenCalledWith(
        handScore,
        gameState
      );
      expect(result.updates.state).toEqual({
        ...gameState,
        trickScores: [existingTrickScore, currentTrickScore],
      });
      expect(result.updates.trickPoints).toEqual(finalTrickScores);
      expect(result.retval).toBe(trickResponse);
      expect(result.broadcastValue).toBe(trickResponse);
    });

    test('works with empty trickScores array (first hand)', () => {
      const player = PLAYER_3;
      const card = createMockCard('♥️', 'K');
      const gameState = createGameState(
        [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
        false,
        { value: GameType.NO_TRUMP, trumpSuit: null }
      );
      gameState.trickScores = []; // Empty scores

      const deck = createMockDeck();
      const trick = createTrick(3);
      const updatedTrick = {
        ...trick,
        trickCards: [...trick.trickCards, { player, card }],
      };
      const updatedDeck: CardContainer[] = [];
      const playerScoresBefore = createPlayerScores();
      const finalTrickScores = createPlayerScores();
      const handScore = createPlayerScores();
      const currentTrickPoints = createPlayerScores();
      const currentTrickScore: TrickScore = {
        gameType: GameType.NO_TRUMP,
        isChoice: false,
        scores: currentTrickPoints.map((s) => ({
          player: s.player,
          totalPoints: s.score,
        })),
      };
      const trickResponse: TrickResponse = {
        cards: [],
        trickNumber: 1,
        trickStatus: 'UNFINISHED',
      };

      mockHasPlayerTurn.mockReturnValue(true);
      mockHasPlayerCard.mockReturnValue(true);
      mockPlayCard.mockReturnValue(updatedTrick);
      mockRemoveCard.mockReturnValue(updatedDeck);
      mockIsTrickReady.mockReturnValue(true);
      mockGetTaker.mockReturnValue(PLAYER_0);
      mockUpdatedTrickScore.mockReturnValue(finalTrickScores);
      mockNoCardsLeft.mockReturnValue(true);
      mockGetHandsPoints.mockReturnValue(handScore);
      mockCalculateTrickPoints.mockReturnValue(currentTrickScore);
      mockConvertToTrickResponse.mockReturnValue(trickResponse);

      const result = addCardToTrick(
        player,
        card,
        gameState,
        trick,
        deck,
        playerScoresBefore
      );

      expect(result.updates.state?.trickScores).toEqual([currentTrickScore]);
    });
  });

  describe('Edge Cases with Different Player Counts', () => {
    test('works with 3-player game', () => {
      const players = [PLAYER_0, PLAYER_1, PLAYER_2];
      const player = PLAYER_1;
      const card = createMockCard('♥️', 'K');
      const gameState = createGameState(players, false, {
        value: GameType.NO_TRUMP,
        trumpSuit: null,
      });
      const deck = createMockDeck();
      const trick = createTrick(1);
      const updatedTrick = {
        ...trick,
        trickCards: [...trick.trickCards, { player, card }],
      };
      const updatedDeck = [
        { card: createMockCard('♠️', 'A'), isPlayed: false },
      ];
      const trickResponse: TrickResponse = {
        cards: [],
        trickNumber: 1,
        trickStatus: 'UNFINISHED',
      };

      mockHasPlayerTurn.mockReturnValue(true);
      mockHasPlayerCard.mockReturnValue(true);
      mockPlayCard.mockReturnValue(updatedTrick);
      mockRemoveCard.mockReturnValue(updatedDeck);
      mockIsTrickReady.mockReturnValue(false);
      mockConvertToTrickResponse.mockReturnValue(trickResponse);

      const result = addCardToTrick(
        player,
        card,
        gameState,
        trick,
        deck,
        undefined
      );

      expect(mockHasPlayerCard).toHaveBeenCalledWith(1, 3, card, deck);
      expect(result.updates.trick).toBe(updatedTrick);
    });
  });
});
