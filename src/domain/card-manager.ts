import { CardEntity } from './card-entity';
import shuffle from 'fisher-yates';

type CardContainer = {
  card: CardEntity;
  isPlayed: boolean;
};

export class CardManager {
  private readonly PLAYERS = 4;
  private readonly CARDS_IN_HAND = 12;

  private _cards: CardContainer[];

  constructor() {
    this._cards = [];
    this.shuffledDeck()
      .map((value: number) => {
        return {
          card: new CardEntity(value),
          isPlayed: false,
        } as CardContainer;
      })
      .forEach((card: CardContainer) => this._cards.push(card));
  }

  public getCardFromPlayersHand(
    playerIndex: number,
    rank: string,
    suit: string
  ): CardEntity {
    return this.cardsInPlayersHand(playerIndex)
      .filter((container) => container.equals(rank, suit))
      .map((container) => container)[0];
  }

  public removeCard(rank: string, suit: string): void {
    this._cards.filter((container) =>
      container.card.equals(rank, suit)
    )[0].isPlayed = true;
  }

  public getTableCards(): CardEntity[] {
    return this._cards
      .slice(this.PLAYERS * this.CARDS_IN_HAND)
      .map((container) => container.card);
  }

  public cardsInPlayersHand(player: number): CardEntity[] {
    return this._cards
      .filter((_val, index) => this.isPlayersCard(player, index))
      .filter((container) => !container.isPlayed)
      .map((container) => container.card);
  }

  private isPlayersCard(player: number, index: number): boolean {
    return Math.trunc((index / this.CARDS_IN_HAND) % this.PLAYERS) === player;
  }

  private shuffledDeck(): number[] {
    const deck = [...this.sequenceGenerator(0, 52)];
    return shuffle(deck);
  }

  private *sequenceGenerator(
    minVal: number,
    maxVal: number
  ): IterableIterator<number> {
    let currVal = minVal;
    while (currVal < maxVal) {
      yield currVal++;
    }
  }
}
