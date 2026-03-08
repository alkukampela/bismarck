import {
  tricksInHand,
  getTrumpSuit,
  initDeck,
  extraCardsAmount,
  getTableCards,
  noCardsLeft,
  roundNumber,
  getPlayersCards,
  hasTooManyCards,
  removeCard,
  hasPlayerCard,
} from './deck-operations';
import { fromNumber, getSuit, getRank } from './card-mapper';
import { CardContainer } from '../types/card-container';
import { Card } from '../../../types/card';
import { SuitEnum } from '../../../types/suit';
import * as shuffleService from '../service/shuffle-service';
import { CardsOfDeck } from '../types/cards-of-deck';

// Test Fixtures
const createFullDeck = (): CardContainer[] => {
  return Array.from({ length: 52 }, (_, i) => ({
    card: fromNumber(i as CardsOfDeck),
    isPlayed: false,
  }));
};

const createDeckWithPlayedCards = (
  playedIndices: number[]
): CardContainer[] => {
  return createFullDeck().map((container, i) =>
    playedIndices.includes(i) ? { ...container, isPlayed: true } : container
  );
};

const createFullyPlayedDeck = (): CardContainer[] => {
  return createDeckWithPlayedCards([...Array(52).keys()]);
};

const TEST_CARDS = {
  ACE_OF_SPADES: fromNumber(51), // A♠️ (last card)
  TWO_OF_HEARTS: fromNumber(26), // 2♥️ (first heart)
  QUEEN_OF_DIAMONDS: fromNumber(10), // Q♦️
  FIVE_OF_CLUBS: fromNumber(16), // 5♣️
};

describe('deck-operations', () => {
  describe('tricksInHand', () => {
    it('should return 16 tricks for 3 players', () => {
      expect(tricksInHand(3)).toBe(16);
    });

    it('should return 12 tricks for 4 players', () => {
      expect(tricksInHand(4)).toBe(12);
    });
  });

  describe('getTrumpSuit', () => {
    it('should return suit of first table card (last 4 cards)', () => {
      const deck = createFullDeck();
      // Card at index 48 (first of last 4)
      const expectedSuit = getSuit(deck[48].card);

      expect(getTrumpSuit(deck)).toBe(expectedSuit);
    });

    it('should handle all 4 suits', () => {
      const suits: Array<{
        suit: '♦️' | '♣️' | '♥️' | '♠️';
        suitEnum: SuitEnum;
      }> = [
        { suit: '♦️', suitEnum: SuitEnum.DIAMOND },
        { suit: '♣️', suitEnum: SuitEnum.CLUB },
        { suit: '♥️', suitEnum: SuitEnum.HEART },
        { suit: '♠️', suitEnum: SuitEnum.SPADE },
      ];

      suits.forEach(({ suit, suitEnum }) => {
        const deck = createFullDeck();
        deck[48].card = { ...deck[48].card, suit };

        expect(getTrumpSuit(deck)).toBe(suitEnum);
      });
    });

    it('should throw error for empty deck', () => {
      expect(() => getTrumpSuit([])).toThrow();
    });
  });

  describe('initDeck', () => {
    let shuffleSpy: jest.SpyInstance;

    beforeEach(() => {
      shuffleSpy = jest
        .spyOn(shuffleService, 'shuffle')
        .mockImplementation((arr) => arr);
    });

    afterEach(() => {
      shuffleSpy.mockRestore();
    });

    it('should return 52 cards', () => {
      const deck = initDeck();
      expect(deck).toHaveLength(52);
    });

    it('should have all cards with isPlayed=false', () => {
      const deck = initDeck();
      expect(deck.every((container) => container.isPlayed === false)).toBe(
        true
      );
    });

    it('should contain all card values with no duplicates', () => {
      const deck = initDeck();
      const cardKeys = deck.map((c) => `${c.card.rank}-${c.card.suit}`);
      const uniqueKeys = new Set(cardKeys);

      expect(uniqueKeys.size).toBe(52);
    });

    it('should call shuffle service with correct input', () => {
      initDeck();
      expect(shuffleSpy).toHaveBeenCalledWith(expect.any(Array));
      expect(shuffleSpy.mock.calls[0][0]).toHaveLength(52);
    });
  });

  describe('extraCardsAmount', () => {
    it('should return 0 extra cards for 3 players with 16 cards', () => {
      expect(extraCardsAmount(16, 3)).toBe(0);
    });

    it('should return 0 extra cards for 4 players with 12 cards', () => {
      expect(extraCardsAmount(12, 4)).toBe(0);
    });

    it('should return difference if cards > cardsInHand', () => {
      expect(extraCardsAmount(18, 3)).toBe(2); // 18 - 16 = 2
      expect(extraCardsAmount(14, 4)).toBe(2); // 14 - 12 = 2
    });

    it('should return 0 if cards <= cardsInHand', () => {
      expect(extraCardsAmount(15, 3)).toBe(0);
      expect(extraCardsAmount(10, 4)).toBe(0);
    });
  });

  describe('getTableCards', () => {
    it('should return last 4 cards from deck as Card objects', () => {
      const deck = createFullDeck();
      const result = getTableCards(deck);

      expect(result).toHaveLength(4);
      expect(result).toEqual([
        deck[48].card,
        deck[49].card,
        deck[50].card,
        deck[51].card,
      ]);
      expect(result[0]).not.toHaveProperty('isPlayed');
    });

    it('should return empty array for empty deck', () => {
      expect(getTableCards([])).toEqual([]);
    });
  });

  describe('noCardsLeft', () => {
    it('should return true when all cards are played', () => {
      const deck = createFullyPlayedDeck();
      expect(noCardsLeft(deck)).toBe(true);
    });

    it('should return false when some cards are not played', () => {
      const deck = createDeckWithPlayedCards([0, 1, 2]);
      expect(noCardsLeft(deck)).toBe(false);
    });

    it('should return false when no cards are played', () => {
      const deck = createFullDeck();
      expect(noCardsLeft(deck)).toBe(false);
    });

    it('should return true for empty deck', () => {
      expect(noCardsLeft([])).toBe(true);
    });
  });

  describe('roundNumber', () => {
    it('should return 0 for player with 16 cards left in 3-player game', () => {
      // Player 0 starts with 16 + 4 = 20 cards.
      // After removing 4 cards, player 0 has 16 cards left
      const deck = createDeckWithPlayedCards([48, 49, 50, 51]);
      expect(roundNumber(0, 3, deck)).toBe(0);
    });

    it('should return 1 for player with 15 cards left in 3-player game', () => {
      // Player 0 starts with 20, remove 4 table cards + 1 = 15 left
      const deck = createDeckWithPlayedCards([0, 48, 49, 50, 51]);
      expect(roundNumber(0, 3, deck)).toBe(1);
    });

    it('should return 16 for player with 0 cards left in 3-player game', () => {
      // Player 0 has cards at indices 0-15 plus table cards 48-51 (20 total)
      const player0Cards = [
        ...Array.from({ length: 16 }, (_, i) => i),
        48,
        49,
        50,
        51,
      ];
      const deck = createDeckWithPlayedCards(player0Cards);
      expect(roundNumber(0, 3, deck)).toBe(16);
    });

    it('should return 0 for player with 12 cards left in 4-player game', () => {
      // Player 0 has 16 cards (12+4), remove the 4 table cards
      const deck = createDeckWithPlayedCards([48, 49, 50, 51]);
      expect(roundNumber(0, 4, deck)).toBe(0);
    });

    it('should return 6 for player with 6 cards left in 4-player game', () => {
      // Player 0 has 12 + 4 = 16 cards
      // To have 6 left, mark 10 as played (6 regular + 4 table)
      const player0FirstTenCards = [0, 1, 2, 3, 4, 5, 48, 49, 50, 51];
      const deck = createDeckWithPlayedCards(player0FirstTenCards);
      expect(roundNumber(0, 4, deck)).toBe(6);
    });

    it("should only count player's own cards", () => {
      // Remove other players' cards (16, 17 are player 1's) and table cards
      // Player 0 still has 16 cards left after table cards removed
      const deck = createDeckWithPlayedCards([16, 17, 48, 49, 50, 51]);
      expect(roundNumber(0, 3, deck)).toBe(0);
    });

    it('should only count unplayed cards', () => {
      // Player 0 starts with 20, remove 2 regular + 4 table = 14 left, played 2 tricks
      const deck = createDeckWithPlayedCards([0, 3, 48, 49, 50, 51]);
      expect(roundNumber(0, 3, deck)).toBe(2);
    });

    it('should return tricksInHand for empty deck', () => {
      expect(roundNumber(0, 3, [])).toBe(16);
      expect(roundNumber(0, 4, [])).toBe(12);
    });
  });

  describe('getPlayersCards', () => {
    it('should return only cards belonging to player', () => {
      const deck = createFullDeck();
      const player0Cards = getPlayersCards(0, 3, deck);

      // Player 0 gets cards at indices 0-15 plus table cards 48-51 (20 total)
      expect(player0Cards).toHaveLength(20);
    });

    it('should exclude played cards', () => {
      const deck = createDeckWithPlayedCards([0, 3]); // Player 0's two cards
      const player0Cards = getPlayersCards(0, 3, deck);

      // Player 0 has 20 cards total, 2 played = 18 left
      expect(player0Cards).toHaveLength(18);
    });

    it('should sort by rank within suit', () => {
      const deck = createFullDeck();
      const cards = getPlayersCards(0, 3, deck);

      // Check consecutive cards of same suit are in rank order
      for (let i = 1; i < cards.length; i++) {
        if (cards[i].suit === cards[i - 1].suit) {
          expect(getRank(cards[i])).toBeGreaterThanOrEqual(
            getRank(cards[i - 1])
          );
        }
      }
    });

    it('should sort by suit (diamonds, clubs, hearts, spades)', () => {
      const deck = createFullDeck();
      const cards = getPlayersCards(0, 3, deck);

      const suitEnums = cards.map((c) => getSuit(c));
      const uniqueSuitEnums = [...new Set(suitEnums)];
      const orderedSuits = [
        SuitEnum.DIAMOND,
        SuitEnum.CLUB,
        SuitEnum.HEART,
        SuitEnum.SPADE,
      ].filter((s) => uniqueSuitEnums.includes(s));

      // Verify suits appear in correct order
      let lastSuitIndex = -1;
      for (const card of cards) {
        const suitIndex = orderedSuits.indexOf(getSuit(card));
        expect(suitIndex).toBeGreaterThanOrEqual(lastSuitIndex);
        if (suitIndex > lastSuitIndex) {
          lastSuitIndex = suitIndex;
        }
      }
    });

    it('should handle player 0 in 3-player game (cards 0-15 + table cards)', () => {
      const deck = createFullDeck();
      const cards = getPlayersCards(0, 3, deck);
      // Player 0 gets 16 regular cards + 4 table cards
      expect(cards).toHaveLength(20);
    });

    it('should handle player 1 in 3-player game (cards 1, 4, 7, 10...)', () => {
      const deck = createFullDeck();
      const cards = getPlayersCards(1, 3, deck);
      expect(cards).toHaveLength(16);
    });

    it('should handle player 2 in 3-player game (cards 2, 5, 8, 11...)', () => {
      const deck = createFullDeck();
      const cards = getPlayersCards(2, 3, deck);
      expect(cards).toHaveLength(16);
    });

    it('should return Card objects (not CardContainer)', () => {
      const deck = createFullDeck();
      const cards = getPlayersCards(0, 3, deck);

      expect(cards[0]).not.toHaveProperty('isPlayed');
      expect(cards[0]).toHaveProperty('rank');
      expect(cards[0]).toHaveProperty('suit');
    });
  });

  describe('hasTooManyCards', () => {
    it('should return false for player with 16 cards in 3-player game', () => {
      // Player 0 needs to remove 4 cards, after removing them has exactly 16
      const deck = createDeckWithPlayedCards([48, 49, 50, 51]);
      expect(hasTooManyCards(0, 3, deck)).toBe(false);
    });

    it('should return true for player with more than 16 cards in 3-player game', () => {
      // Player 0 has 20 cards (hasn't removed any yet)
      const deck = createFullDeck();
      expect(hasTooManyCards(0, 3, deck)).toBe(true);
    });

    it('should return false for player with 12 cards in 4-player game', () => {
      // Player 0 has removed 4 table cards, left with exactly 12
      const deck = createDeckWithPlayedCards([48, 49, 50, 51]);
      expect(hasTooManyCards(0, 4, deck)).toBe(false);
    });

    it('should return true for player with more than 12 cards in 4-player game', () => {
      // Player 0 has 16 cards (hasn't removed any yet)
      const deck = createFullDeck();
      expect(hasTooManyCards(0, 4, deck)).toBe(true);
    });

    it('should return false for player with 0 cards', () => {
      // Mark all of player 0's cards as played (includes table cards)
      const player0Cards = [
        ...Array.from({ length: 16 }, (_, i) => i),
        48,
        49,
        50,
        51,
      ];
      const deck = createDeckWithPlayedCards(player0Cards);
      expect(hasTooManyCards(0, 3, deck)).toBe(false);
    });
  });

  describe('removeCard', () => {
    describe('Happy Path', () => {
      it('should return new deck with target card marked isPlayed=true, other cards unchanged', () => {
        const deck = createFullDeck();
        const cardToRemove = deck[0].card;

        const result = removeCard(cardToRemove, deck);

        expect(result[0].isPlayed).toBe(true);
        expect(result[0].card).toEqual(cardToRemove);

        // Other cards unchanged
        for (let i = 1; i < result.length; i++) {
          expect(result[i].isPlayed).toBe(false);
        }
      });

      it('should match card by rank AND suit', () => {
        const deck = createFullDeck();
        const targetCard = deck[10].card;

        const result = removeCard(targetCard, deck);

        // Only the exact card should be marked played
        let playedCount = 0;
        result.forEach((container) => {
          if (container.isPlayed) {
            expect(container.card.rank).toBe(targetCard.rank);
            expect(container.card.suit).toBe(targetCard.suit);
            playedCount++;
          }
        });
        expect(playedCount).toBe(1);
      });

      it('should return new array (original deck unchanged, immutable operation)', () => {
        const deck = createFullDeck();
        const originalDeck = JSON.parse(JSON.stringify(deck));
        const cardToRemove = deck[5].card;

        const result = removeCard(cardToRemove, deck);

        // Result is different array
        expect(result).not.toBe(deck);

        // Original unchanged
        expect(deck).toEqual(originalDeck);
        expect(deck[5].isPlayed).toBe(false);
      });
    });

    describe('Error Cases', () => {
      it('should throw "Card not found" when card not in deck', () => {
        const deck = createFullDeck();
        const nonExistentCard: Card = { rank: '99' as any, suit: '♠️' };

        expect(() => removeCard(nonExistentCard, deck)).toThrow(
          'Card not found'
        );
      });

      it('should throw "Card already played" when card is already played', () => {
        const deck = createDeckWithPlayedCards([0]);
        const alreadyPlayedCard = deck[0].card;

        expect(() => removeCard(alreadyPlayedCard, deck)).toThrow(
          'Card already played'
        );
      });
    });
  });

  describe('hasPlayerCard', () => {
    it('should return true when player has card (unplayed)', () => {
      const deck = createFullDeck();
      const player0FirstCard = deck[0].card;

      expect(hasPlayerCard(0, 3, player0FirstCard, deck)).toBe(true);
    });

    it('should return false when player has card already played', () => {
      const deck = createDeckWithPlayedCards([0]);
      const player0FirstCard = deck[0].card;

      expect(hasPlayerCard(0, 3, player0FirstCard, deck)).toBe(false);
    });

    it('should return false when player does not have card', () => {
      const deck = createFullDeck();
      const nonExistentCard: Card = { rank: '99' as any, suit: '♠️' };

      expect(hasPlayerCard(0, 3, nonExistentCard, deck)).toBe(false);
    });

    it('should return false when card belongs to different player', () => {
      const deck = createFullDeck();
      const player1Card = deck[16].card; // Index 16 belongs to player 1

      expect(hasPlayerCard(0, 3, player1Card, deck)).toBe(false);
    });

    it('should return false for empty deck', () => {
      expect(hasPlayerCard(0, 3, TEST_CARDS.ACE_OF_SPADES, [])).toBe(false);
    });
  });
});
