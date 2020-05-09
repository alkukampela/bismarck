import { CardEntity } from './card-entity';
import { StorageService, CardContainer } from '../persistence/storage-service';
import { Card } from '../types/card';
import { Suit } from '../types/suit';
import shuffle from 'fisher-yates';

export class CardManager {
  private readonly PLAYERS = 4;
  private readonly CARDS_IN_HAND = 12;

  private static _instance: CardManager;

  private _storageService: StorageService;

  private constructor(storageService: StorageService) {
    this._storageService = storageService;
  }

  public static getInstance(storageService: StorageService) {
    return this._instance || (this._instance = new this(storageService));
  }

  public initDeck(gameId: string): void {
    const cards: CardContainer[] = [];
    this.shuffledDeck()
      .map((value: number) => {
        return new CardEntity(value).toCard();
      })
      .forEach((card) => cards.push({ card, isPlayed: false }));
    this._storageService.storeCards(gameId, cards);
  }

  public async hasPlayerCard(
    player: number,
    card: Card,
    gameId: string
  ): Promise<boolean> {
    const cards = await this.getPlayersCards(player, gameId);
    return (
      cards.filter((pc: Card) => pc.rank === card.rank && pc.suit === card.suit)
        .length > 0
    );
  }

  public removeCard(cardToBeRemoved: Card, gameId: string): void {
    this._storageService.fetchCards(gameId).then((cards) => {
      cards.find(
        (container) =>
          container.card.rank === cardToBeRemoved.rank &&
          container.card.suit === cardToBeRemoved.suit
      ).isPlayed = true;
      this._storageService.storeCards(gameId, cards);
    });
  }

  public async getTableCards(gameId: string): Promise<Card[]> {
    const cards = await this._storageService.fetchCards(gameId);
    return cards
      .slice(this.PLAYERS * this.CARDS_IN_HAND)
      .map((container) => container.card);
  }

  public async getPlayersCards(
    player: number,
    gameId: string
  ): Promise<Card[]> {
    const cards = await this._storageService.fetchCards(gameId);
    return cards
      .filter((_val, index) => this.isPlayersCard(player, index))
      .filter((container) => !container.isPlayed)
      .sort(
        (a, b) =>
          CardEntity.fromCard(a.card).getRank() -
          CardEntity.fromCard(b.card).getRank()
      )
      .sort(
        (a, b) =>
          CardEntity.fromCard(a.card).getSuit() -
          CardEntity.fromCard(b.card).getSuit()
      )
      .map((container) => container.card);
  }

  public async getTrumpSuit(gameId: string): Promise<Suit> {
    const cards = await this._storageService.fetchCards(gameId);
    return CardEntity.suits.get(
      cards
        .slice(this.PLAYERS * this.CARDS_IN_HAND)
        .map((container) => container.card)[0].suit
    );
  }

  public async hasTooManyCards(
    player: number,
    gameId: string
  ): Promise<boolean> {
    return this.getPlayersCards(player, gameId).then((cards) => {
      return cards.length > this.CARDS_IN_HAND;
    });
  }

  public async hasPlayerCardsOfSuit(
    player: number,
    suit: Suit,
    gameId: string
  ): Promise<boolean> {
    const cards = await this._storageService.fetchCards(gameId);
    return (
      cards
        .filter((_val, index) => this.isPlayersCard(player, index))
        .filter((container) => !container.isPlayed)
        .filter(
          (container) => container.card.suit === CardEntity.suits.getKey(suit)
        ).length > 0
    );
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
