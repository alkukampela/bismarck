import { getPlayersHand } from './hand-service';
import { Player } from '../../../types/player';
import { GameState, GameTypeData } from '../types/game-state';
import { CardContainer } from '../types/card-container';
import { Card, Rank, Suit, ALL_RANKS } from '../../../types/card';
import { GameType } from '../../../types/game-type';
import { SuitEnum } from '../../../types/suit';
import * as deckOperations from './deck-operations';

// Mock deck-operations module
jest.mock('./deck-operations', () => ({
  ...jest.requireActual('./deck-operations'),
  getPlayersCards: jest.fn(),
  extraCardsAmount: jest.fn(),
}));

// Test Fixtures
const PLAYER_ALICE: Player = { name: 'Alice' };
const PLAYER_BOB: Player = { name: 'Bob' };
const PLAYER_CHARLIE: Player = { name: 'Charlie' };
const PLAYER_DIANA: Player = { name: 'Diana' };

const createGameState = (
  players: Player[],
  isChoice: boolean,
  gameType: GameTypeData | null | undefined
): GameState => ({
  players,
  handNumber: 1,
  handStatute: {
    gameType: gameType as GameTypeData | null,
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

const createMockCards = (count: number): Card[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockCard('♥️', ALL_RANKS[i % ALL_RANKS.length])
  );
};

describe('getPlayersHand', () => {
  let mockGetPlayersCards: jest.MockedFunction<
    typeof deckOperations.getPlayersCards
  >;
  let mockExtraCardsAmount: jest.MockedFunction<
    typeof deckOperations.extraCardsAmount
  >;

  beforeEach(() => {
    mockGetPlayersCards = deckOperations.getPlayersCards as jest.MockedFunction<
      typeof deckOperations.getPlayersCards
    >;
    mockExtraCardsAmount =
      deckOperations.extraCardsAmount as jest.MockedFunction<
        typeof deckOperations.extraCardsAmount
      >;
    jest.clearAllMocks();
  });

  describe('Edge Cases - Early Returns', () => {
    test('returns empty hand when gameState is undefined', () => {
      const player = PLAYER_ALICE;
      const deck = createMockDeck();

      const result = getPlayersHand(player, undefined, deck);

      expect(result).toEqual({
        updates: {},
        retval: { cards: [], extraCards: 0 },
      });
      expect(mockGetPlayersCards).not.toHaveBeenCalled();
      expect(mockExtraCardsAmount).not.toHaveBeenCalled();
    });

    test('returns empty hand when isChoice=true and gameType is null', () => {
      const player = PLAYER_ALICE;
      const gameState = createGameState(
        [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE, PLAYER_DIANA],
        true,
        null
      );
      const deck = createMockDeck();

      const result = getPlayersHand(player, gameState, deck);

      expect(result).toEqual({
        updates: {},
        retval: { cards: [], extraCards: 0 },
      });
      expect(mockGetPlayersCards).not.toHaveBeenCalled();
      expect(mockExtraCardsAmount).not.toHaveBeenCalled();
    });

    test('returns empty hand when isChoice=true and gameType is undefined', () => {
      const player = PLAYER_ALICE;
      const gameState = createGameState(
        [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE, PLAYER_DIANA],
        true,
        undefined
      );
      const deck = createMockDeck();

      const result = getPlayersHand(player, gameState, deck);

      expect(result).toEqual({
        updates: {},
        retval: { cards: [], extraCards: 0 },
      });
      expect(mockGetPlayersCards).not.toHaveBeenCalled();
      expect(mockExtraCardsAmount).not.toHaveBeenCalled();
    });
  });

  describe('Happy Path - Correct Delegation to Dependencies', () => {
    test('calls dependencies with correct parameters for 4-player game', () => {
      const players = [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE, PLAYER_DIANA];
      const gameState = createGameState(players, false, {
        value: GameType.NO_TRUMP,
        trumpSuit: null,
      });
      const deck = createMockDeck();
      const mockCards = createMockCards(12);

      mockGetPlayersCards.mockReturnValue(mockCards);
      mockExtraCardsAmount.mockReturnValue(0);

      const result = getPlayersHand(PLAYER_BOB, gameState, deck);

      // Bob is at index 1 in playerOrder
      expect(mockGetPlayersCards).toHaveBeenCalledWith(1, 4, deck);
      expect(mockExtraCardsAmount).toHaveBeenCalledWith(12, 4);
      expect(result).toEqual({
        updates: {},
        retval: { cards: mockCards, extraCards: 0 },
      });
    });

    test('returns mocked values correctly for 3-player game with extra cards', () => {
      const players = [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE];
      const gameState = createGameState(players, false, {
        value: GameType.TRUMP,
        trumpSuit: SuitEnum.HEART,
      });
      const deck = createMockDeck();
      const mockCards = createMockCards(18);

      mockGetPlayersCards.mockReturnValue(mockCards);
      mockExtraCardsAmount.mockReturnValue(2);

      const result = getPlayersHand(PLAYER_ALICE, gameState, deck);

      // Alice is at index 0 in playerOrder
      expect(mockGetPlayersCards).toHaveBeenCalledWith(0, 3, deck);
      expect(mockExtraCardsAmount).toHaveBeenCalledWith(18, 3);
      expect(result).toEqual({
        updates: {},
        retval: { cards: mockCards, extraCards: 2 },
      });
    });

    test('works when isChoice=false and gameType is null', () => {
      const players = [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE, PLAYER_DIANA];
      const gameState = createGameState(players, false, null);
      const deck = createMockDeck();
      const mockCards = createMockCards(12);

      mockGetPlayersCards.mockReturnValue(mockCards);
      mockExtraCardsAmount.mockReturnValue(0);

      const result = getPlayersHand(PLAYER_CHARLIE, gameState, deck);

      // Should NOT trigger early return
      // Charlie is at index 2 in playerOrder
      expect(mockGetPlayersCards).toHaveBeenCalledWith(2, 4, deck);
      expect(mockExtraCardsAmount).toHaveBeenCalledWith(12, 4);
      expect(result).toEqual({
        updates: {},
        retval: { cards: mockCards, extraCards: 0 },
      });
    });

    test('works when isChoice=true but gameType is defined', () => {
      const players = [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE, PLAYER_DIANA];
      const gameState = createGameState(players, true, {
        value: GameType.TRUMP,
        trumpSuit: SuitEnum.HEART,
      });
      const deck = createMockDeck();
      const mockCards = createMockCards(12);

      mockGetPlayersCards.mockReturnValue(mockCards);
      mockExtraCardsAmount.mockReturnValue(0);

      const result = getPlayersHand(PLAYER_DIANA, gameState, deck);

      // Should NOT trigger early return
      // Diana is at index 3 in playerOrder
      expect(mockGetPlayersCards).toHaveBeenCalledWith(3, 4, deck);
      expect(mockExtraCardsAmount).toHaveBeenCalledWith(12, 4);
      expect(result).toEqual({
        updates: {},
        retval: { cards: mockCards, extraCards: 0 },
      });
    });

    test('correctly identifies player index in playerOrder', () => {
      const players = [PLAYER_CHARLIE, PLAYER_ALICE, PLAYER_BOB, PLAYER_DIANA];
      const gameState = createGameState(players, false, {
        value: GameType.NO_TRUMP,
        trumpSuit: null,
      });
      const deck = createMockDeck();
      const mockCards = createMockCards(12);

      mockGetPlayersCards.mockReturnValue(mockCards);
      mockExtraCardsAmount.mockReturnValue(0);

      // Get hand for Alice, who is at index 1 in this playerOrder
      const result = getPlayersHand(PLAYER_ALICE, gameState, deck);

      expect(mockGetPlayersCards).toHaveBeenCalledWith(1, 4, deck);
      expect(result.updates).toEqual({});
      expect(result.retval.cards).toEqual(mockCards);
    });
  });

  describe('Various Player Counts', () => {
    test('handles 3-player game correctly', () => {
      const players = [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE];
      const gameState = createGameState(players, false, {
        value: GameType.TRUMP,
        trumpSuit: SuitEnum.SPADE,
      });
      const deck = createMockDeck();
      const mockCards = createMockCards(16);

      mockGetPlayersCards.mockReturnValue(mockCards);
      mockExtraCardsAmount.mockReturnValue(0);

      const result = getPlayersHand(PLAYER_BOB, gameState, deck);

      // Bob is at index 1, player count is 3
      expect(mockGetPlayersCards).toHaveBeenCalledWith(1, 3, deck);
      expect(mockExtraCardsAmount).toHaveBeenCalledWith(16, 3);
      expect(result.updates).toEqual({});
      expect(result.retval.cards).toEqual(mockCards);
    });

    test('handles first player (index 0) correctly', () => {
      const players = [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE, PLAYER_DIANA];
      const gameState = createGameState(players, false, {
        value: GameType.NO_TRUMP,
        trumpSuit: null,
      });
      const deck = createMockDeck();
      const mockCards = createMockCards(12);

      mockGetPlayersCards.mockReturnValue(mockCards);
      mockExtraCardsAmount.mockReturnValue(0);

      const result = getPlayersHand(PLAYER_ALICE, gameState, deck);

      expect(mockGetPlayersCards).toHaveBeenCalledWith(0, 4, deck);
      expect(result.updates).toEqual({});
      expect(result.retval.cards).toEqual(mockCards);
    });

    test('handles last player (index 3) correctly', () => {
      const players = [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE, PLAYER_DIANA];
      const gameState = createGameState(players, false, {
        value: GameType.NO_TRUMP,
        trumpSuit: null,
      });
      const deck = createMockDeck();
      const mockCards = createMockCards(12);

      mockGetPlayersCards.mockReturnValue(mockCards);
      mockExtraCardsAmount.mockReturnValue(0);

      const result = getPlayersHand(PLAYER_DIANA, gameState, deck);

      expect(mockGetPlayersCards).toHaveBeenCalledWith(3, 4, deck);
      expect(result.updates).toEqual({});
      expect(result.retval.cards).toEqual(mockCards);
    });
  });

  describe('Extra Cards Calculation', () => {
    test('returns correct extraCards value when player has extra cards', () => {
      const players = [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE, PLAYER_DIANA];
      const gameState = createGameState(players, false, {
        value: GameType.TRUMP,
        trumpSuit: SuitEnum.CLUB,
      });
      const deck = createMockDeck();
      const mockCards = createMockCards(14);

      mockGetPlayersCards.mockReturnValue(mockCards);
      mockExtraCardsAmount.mockReturnValue(2);

      const result = getPlayersHand(PLAYER_ALICE, gameState, deck);

      expect(mockExtraCardsAmount).toHaveBeenCalledWith(14, 4);
      expect(result.updates).toEqual({});
      expect(result.retval.extraCards).toBe(2);
    });

    test('returns 0 extraCards when player has normal card count', () => {
      const players = [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE, PLAYER_DIANA];
      const gameState = createGameState(players, false, {
        value: GameType.NO_TRUMP,
        trumpSuit: null,
      });
      const deck = createMockDeck();
      const mockCards = createMockCards(12);

      mockGetPlayersCards.mockReturnValue(mockCards);
      mockExtraCardsAmount.mockReturnValue(0);

      const result = getPlayersHand(PLAYER_ALICE, gameState, deck);

      expect(mockExtraCardsAmount).toHaveBeenCalledWith(12, 4);
      expect(result.updates).toEqual({});
      expect(result.retval.extraCards).toBe(0);
    });

    test('passes cards.length to extraCardsAmount', () => {
      const players = [PLAYER_ALICE, PLAYER_BOB, PLAYER_CHARLIE];
      const gameState = createGameState(players, false, {
        value: GameType.TRUMP,
        trumpSuit: SuitEnum.DIAMOND,
      });
      const deck = createMockDeck();
      const mockCards = createMockCards(18);

      mockGetPlayersCards.mockReturnValue(mockCards);
      mockExtraCardsAmount.mockReturnValue(2);

      const result = getPlayersHand(PLAYER_ALICE, gameState, deck);

      // Verify it's called with the length of the returned cards array
      expect(mockExtraCardsAmount).toHaveBeenCalledWith(18, 3);
      expect(result.updates).toEqual({});
    });
  });
});
