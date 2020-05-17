import { fromNumber, getRank, getSuit } from './card-mapper';
import { CardContainer, StorageService } from '../persistence/storage-service';
import { Card } from '../types/card';
import { Suit } from '../types/suit';
import shuffle from 'fisher-yates';

export class CardManager {
  private readonly TABLE_CARDS = 4;
  private readonly DECK_SIZE = 52;

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
        return fromNumber(value);
      })
      .forEach((card) => cards.push({ card, isPlayed: false }));
    this._storageService.storeCards(cards, gameId);
  }

  public async hasPlayerCard(
    player: number,
    playersInGame: number,
    card: Card,
    gameId: string
  ): Promise<boolean> {
    const cards = await this.getPlayersCards(player, playersInGame, gameId);
    return (
      cards.filter((pc: Card) => pc.rank === card.rank && pc.suit === card.suit)
        .length > 0
    );
  }

  public async removeCard(cardToBeRemoved: Card, gameId: string) {
    const cards = await this._storageService.fetchCards(gameId);

    cards.find(
      (container) =>
        container.card.rank === cardToBeRemoved.rank &&
        container.card.suit === cardToBeRemoved.suit
    ).isPlayed = true;

    this._storageService.storeCards(cards, gameId);
  }

  public async getTableCards(gameId: string): Promise<Card[]> {
    const cards = await this._storageService.fetchCards(gameId);
    if (!cards) {
      return [];
    }
    return cards
      .slice(-1 * this.TABLE_CARDS)
      .map((container) => container.card);
  }

  public async getPlayersCards(
    player: number,
    playersInGame: number,
    gameId: string
  ): Promise<Card[]> {
    const cards = await this._storageService.fetchCards(gameId);
    return cards
      .filter((_val, index) => this.isPlayersCard(player, playersInGame, index))
      .filter((container) => !container.isPlayed)
      .sort((a, b) => getRank(a.card) - getRank(b.card))
      .sort((a, b) => getSuit(a.card) - getSuit(b.card))
      .map((container) => container.card);
  }

  public async getTrumpSuit(gameId: string): Promise<Suit> {
    const cards = await this._storageService.fetchCards(gameId);
    return getSuit(
      cards.slice(-1 * this.TABLE_CARDS).map((container) => container.card)[0]
    );
  }

  public async hasTooManyCards(
    player: number,
    playersInGame: number,
    gameId: string
  ): Promise<boolean> {
    return this.getPlayersCards(player, playersInGame, gameId).then((cards) => {
      return cards.length > this.cardsInHand(playersInGame);
    });
  }

  public async hasPlayerCardsOfSuit(
    player: number,
    playersInGame: number,
    suit: Suit,
    gameId: string
  ): Promise<boolean> {
    const cards = await this._storageService.fetchCards(gameId);
    return (
      cards
        .filter((_val, index) =>
          this.isPlayersCard(player, playersInGame, index)
        )
        .filter((container) => !container.isPlayed)
        .filter((container) => getSuit(container.card) === suit).length > 0
    );
  }

  public async noCardsLeft(gameId: string): Promise<boolean> {
    const cards = await this._storageService.fetchCards(gameId);
    console.log(cards);
    return !cards || cards.filter((card) => !card.isPlayed).length === 0;
  }

  private isPlayersCard(
    player: number,
    playersInGame: number,
    cardIndex: number
  ): boolean {
    return (
      Math.trunc(
        (cardIndex / this.cardsInHand(playersInGame)) % playersInGame
      ) === player
    );
  }

  private cardsInHand(playersInGame: number): number {
    return (this.DECK_SIZE - this.TABLE_CARDS) / playersInGame;
  }

  private shuffledDeck(): number[] {
    const deck = [...this.sequenceGenerator(0, this.DECK_SIZE)];
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
