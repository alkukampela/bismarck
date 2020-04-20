import { CardEntity } from './card-entity';
import { Card } from '../types/card';
import { Suit } from '../types/suit';
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

  public hasPlayerCard(playerIndex: number, card: Card): boolean {
    return (
      this.getPlayersCards(playerIndex).filter((c) =>
        c.equals(card.rank, card.suit)
      ).length > 0
    );
  }

  public removeCard(card: Card): void {
    this._cards.filter((container) =>
      container.card.equals(card.rank, card.suit)
    )[0].isPlayed = true;
  }

  public getTableCards(): CardEntity[] {
    return this._cards
      .slice(this.PLAYERS * this.CARDS_IN_HAND)
      .map((container) => container.card);
  }

  public getPlayersCards(player: number): CardEntity[] {
    return this._cards
      .filter((_val, index) => this.isPlayersCard(player, index))
      .filter((container) => !container.isPlayed)
      .sort((a, b) => a.card.getRank() - b.card.getRank())
      .sort((a, b) => a.card.getSuit() - b.card.getSuit())
      .map((container) => container.card);
  }

  public getTrumpSuit(): Suit {
    return this.getTableCards()[0].getSuit();
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
