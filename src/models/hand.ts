import { CardContainer } from './card-container';

const PLAYERS = 4;
const CARDS_IN_HAND = 12;

class Hand {

  private _cards: CardContainer[];

  private _eldestHand: number;

  constructor(shuffledCards: number[], eldestHand: number) {
    this._cards = [];
    shuffledCards.map((x: number) => new CardContainer(x)).forEach(card => this._cards.push(card));
    this._eldestHand = eldestHand;
  }

  public getCards(player: number) {
    return this.cardsInPlayersHand(player)
      .map(x => x.getCard().printOut());
  }

  removeCard(player: number, rank: string, suit: string) : boolean {
    if (player !== this._eldestHand || this.cardsInPlayersHand(player).length <= 12) {
      return false;
    }

    const card = this.cardsInPlayersHand(player)
      .filter(x => x.getCard().equals(rank, suit))[0];

    if (card) {
      card.setPlayed();
      return true;
    }

    return false;
  }

  private cardsInPlayersHand(player: number): CardContainer[] {
    return this._cards
      .filter((_val, index) => this.isPlayersCard(player, index))
      .filter(x => !x.isPlayed());
  }

  private isPlayersCard(player: number, index: number): boolean {
    return Math.trunc((index / CARDS_IN_HAND) % PLAYERS) === player;
  }
}
export { Hand };
