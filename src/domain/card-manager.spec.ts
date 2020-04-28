import { CardManager } from './card-manager';
import { CardEntity } from './card-entity';

test('Ensure deals correct amount of cards', () => {
  const cardManager = new CardManager();

  expect(cardManager.getPlayersCards(0).length).toBe(16);
  expect(cardManager.getPlayersCards(1).length).toBe(12);
  expect(cardManager.getPlayersCards(2).length).toBe(12);
  expect(cardManager.getPlayersCards(3).length).toBe(12);
});

test('Ensure returns four table cards', () => {
  const cardManager = new CardManager();

  const actual = cardManager.getTableCards();

  expect(actual.length).toBe(4);
});

test('Ensure removed card is not in players hand after removal', () => {
  const player = 0;
  const cardManager = new CardManager();
  const cards = cardManager.getPlayersCards(player);

  const cardToBeRemoved = cards[0];

  cardManager.removeCard(cardToBeRemoved);

  expect(cardManager.getPlayersCards(player).length).toBe(cards.length - 1);
  expect(
    cardManager
      .getPlayersCards(player)
      .filter(
        (x) =>
          x.rank === cardToBeRemoved.rank && x.suit === cardToBeRemoved.suit
      ).length
  ).toBe(0);
});

test('Ensure card returned as players card is actually players card', () => {
  const player = 2;
  const cardManager = new CardManager();
  const cards = cardManager.getPlayersCards(player);

  cards.forEach((card) =>
    expect(cardManager.hasPlayerCard(player, card)).toBe(true)
  );
});

test('Ensure returns correct trump suit', () => {
  const cardManager = new CardManager();
  const openCards = cardManager.getTableCards();
  const expectedTrumpSuit = CardEntity.getSuit(openCards[0]);

  expect(cardManager.getTrumpSuit()).toBe(expectedTrumpSuit);
});

test('Ensure eldest hand has too many cards until removed 4', () => {
  const player = 0;
  const cardManager = new CardManager();

  expect(cardManager.hasTooManyCards(player)).toBe(true);

  cardManager.removeCard(cardManager.getPlayersCards(0)[0]);
  expect(cardManager.hasTooManyCards(player)).toBe(true);

  cardManager.removeCard(cardManager.getPlayersCards(0)[0]);
  expect(cardManager.hasTooManyCards(player)).toBe(true);

  cardManager.removeCard(cardManager.getPlayersCards(0)[0]);
  expect(cardManager.hasTooManyCards(player)).toBe(true);

  cardManager.removeCard(cardManager.getPlayersCards(0)[0]);
  expect(cardManager.hasTooManyCards(player)).toBe(false);
});
