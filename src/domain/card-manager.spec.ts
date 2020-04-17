import { CardManager } from './card-manager';

test('Ensure deals correct amount of cards', () => {
  const cardManager = new CardManager();

  expect(cardManager.cardsInPlayersHand(0).length).toBe(16);
  expect(cardManager.cardsInPlayersHand(1).length).toBe(12);
  expect(cardManager.cardsInPlayersHand(2).length).toBe(12);
  expect(cardManager.cardsInPlayersHand(3).length).toBe(12);
});

test('Ensure returns four table cards', () => {
  const cardManager = new CardManager();

  const actual = cardManager.getTableCards();

  expect(actual.length).toBe(4);
});

test('Ensure removed card is not in players hand after removal', () => {
  const player = 0;
  const cardManager = new CardManager();
  const cards = cardManager.cardsInPlayersHand(player);

  const cardToBeRemoved = cards[0].presentation();

  cardManager.removeCard(cardToBeRemoved.rank, cardToBeRemoved.suit);

  expect(cardManager.cardsInPlayersHand(player).length).toBe(cards.length - 1);
  expect(
    cardManager
      .cardsInPlayersHand(player)
      .filter((x) => x.equals(cardToBeRemoved.rank, cardToBeRemoved.suit))
      .length
  ).toBe(0);
});
