import { Card } from '../../../types/card';
import { Player } from '../../../types/player';
import { GameType } from '../../../types/game-type';
import { removePlayersCard } from './hand-service';
import * as deckOperations from './deck-operations';
import { CardContainer } from '../types/card-container';
import { GameState } from '../types/game-state';
import { GameError } from '../utils/game-error';
import { ErrorTypes } from '../types/error-types';

jest.mock('./deck-operations', () => ({
  ...jest.requireActual('./deck-operations'),
  hasPlayerCard: jest.fn(),
  hasTooManyCards: jest.fn(),
  removeCard: jest.fn(),
}));

const PLAYER_0: Player = { name: 'Arnold' };
const PLAYER_1: Player = { name: 'Betsie' };
const PLAYER_2: Player = { name: 'Cordelia' };
const PLAYER_3: Player = { name: 'Derward' };

const CARD_0: Card = { rank: '3', suit: '♦️' };
const CARD_1: Card = { rank: '4', suit: '♦️' };

describe('removePlayersCard', () => {
  const card: Card = CARD_0;
  const deck: CardContainer[] = [{ card: CARD_0, isPlayed: false }];

  const gameState: GameState = {
    handStatute: {
      eldestHand: PLAYER_0,
      gameType: { value: GameType.NO_TRUMP, trumpSuit: null },
      playerOrder: [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
      isChoice: false,
      tricksInHand: 0,
    },
    players: [PLAYER_0, PLAYER_1, PLAYER_2, PLAYER_3],
    handNumber: 0,
    trickScores: [],
  };

  describe('validations', () => {
    test('throws GAME_NOT_FOUND when gameState is undefined', () => {
      expect(() => removePlayersCard(PLAYER_0, card, undefined, deck)).toThrow(
        new GameError(ErrorTypes.GAME_NOT_FOUND)
      );
    });

    test('throws MUST_BE_ELDEST_HAND when player is not eldest hand', () => {
      expect(() => removePlayersCard(PLAYER_1, card, gameState, deck)).toThrow(
        new GameError(ErrorTypes.MUST_BE_ELDEST_HAND)
      );
    });

    test('throws GAME_TYPE_NOT_CHOSEN when gameType is null', () => {
      const mockState: GameState = {
        ...gameState,
        handStatute: {
          ...gameState.handStatute,
          gameType: null,
        },
      };
      expect(() => removePlayersCard(PLAYER_0, card, mockState, deck)).toThrow(
        new GameError(ErrorTypes.GAME_TYPE_NOT_CHOSEN)
      );
    });

    test('throws UNEXPECTED_ERROR when deck is empty', () => {
      expect(() => removePlayersCard(PLAYER_0, card, gameState, [])).toThrow(
        new GameError(ErrorTypes.UNEXPECTED_ERROR)
      );
    });

    test("throws CARD_NOT_FOUND when player doesn't have the card", () => {
      (deckOperations.hasPlayerCard as jest.Mock).mockReturnValueOnce(false);
      expect(() => removePlayersCard(PLAYER_0, card, gameState, deck)).toThrow(
        new GameError(ErrorTypes.CARD_NOT_FOUND)
      );
      (deckOperations.hasPlayerCard as jest.Mock).mockReturnValueOnce(false);
      expect(() => removePlayersCard(PLAYER_0, card, gameState, deck)).toThrow(
        new GameError(ErrorTypes.CARD_NOT_FOUND)
      );
    });

    test('throws NO_MORE_CARDS_TO_REMOVE when player has normal card count', () => {
      (deckOperations.hasPlayerCard as jest.Mock).mockReturnValueOnce(true);
      (deckOperations.hasTooManyCards as jest.Mock).mockReturnValueOnce(false);
      expect(() => removePlayersCard(PLAYER_0, card, gameState, deck)).toThrow(
        new GameError(ErrorTypes.NO_MORE_CARDS_TO_REMOVE)
      );
      (deckOperations.hasPlayerCard as jest.Mock).mockReturnValueOnce(true);
      (deckOperations.hasTooManyCards as jest.Mock).mockReturnValueOnce(false);
      expect(() => removePlayersCard(PLAYER_0, card, gameState, deck)).toThrow(
        new GameError(ErrorTypes.NO_MORE_CARDS_TO_REMOVE)
      );
    });
  });

  describe('successful scenarios', () => {
    test('removes card with 3 players', () => {
      const card = CARD_0;
      const deck: CardContainer[] = [
        { card: CARD_0, isPlayed: false },
        { card: CARD_1, isPlayed: false },
      ];
      const playerOrder = [PLAYER_0, PLAYER_1, PLAYER_2];
      const gameState: GameState = {
        handStatute: {
          eldestHand: PLAYER_0,
          gameType: { value: GameType.NO_TRUMP, trumpSuit: null },
          playerOrder,
          isChoice: false,
          tricksInHand: 0,
        },
        players: playerOrder,
        handNumber: 0,
        trickScores: [],
      };

      (deckOperations.hasPlayerCard as jest.Mock).mockReturnValueOnce(true);
      (deckOperations.hasTooManyCards as jest.Mock).mockReturnValueOnce(true);
      const updatedDeck: CardContainer[] = [{ card: CARD_1, isPlayed: false }];
      (deckOperations.removeCard as jest.Mock).mockReturnValueOnce(updatedDeck);

      const result = removePlayersCard(PLAYER_0, card, gameState, deck);

      expect(deckOperations.hasPlayerCard).toHaveBeenCalledWith(
        0,
        3,
        card,
        deck
      );
      expect(deckOperations.hasTooManyCards).toHaveBeenCalledWith(0, 3, deck);
      expect(deckOperations.removeCard).toHaveBeenCalledWith(card, deck);
      expect(result).toEqual({ updates: { deck: updatedDeck }, retval: card });
    });

    test('removes card with 4 players', () => {
      const deck: CardContainer[] = [
        { card: CARD_0, isPlayed: false },
        { card: CARD_1, isPlayed: false },
      ];
      const playerOrder = [PLAYER_1, PLAYER_2, PLAYER_3, PLAYER_0];
      const gameState: GameState = {
        handStatute: {
          eldestHand: PLAYER_1,
          gameType: { value: GameType.NO_TRUMP, trumpSuit: null },
          playerOrder,
          isChoice: false,
          tricksInHand: 0,
        },
        players: playerOrder,
        handNumber: 0,
        trickScores: [],
      };

      (deckOperations.hasPlayerCard as jest.Mock).mockReturnValueOnce(true);
      (deckOperations.hasTooManyCards as jest.Mock).mockReturnValueOnce(true);
      const updatedDeck: CardContainer[] = [{ card: CARD_1, isPlayed: false }];
      (deckOperations.removeCard as jest.Mock).mockReturnValueOnce(updatedDeck);

      const result = removePlayersCard(PLAYER_1, card, gameState, deck);

      expect(deckOperations.hasPlayerCard).toHaveBeenCalledWith(
        0,
        4,
        card,
        deck
      );
      expect(deckOperations.hasTooManyCards).toHaveBeenCalledWith(0, 4, deck);
      expect(deckOperations.removeCard).toHaveBeenCalledWith(card, deck);
      expect(result).toEqual({ updates: { deck: updatedDeck }, retval: card });
    });
  });
});
