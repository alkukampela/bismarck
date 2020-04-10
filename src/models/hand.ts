import { CardContainer } from './card-container';
import { Trick } from './trick';

const PLAYERS = 4;
const CARDS_IN_HAND = 12;

class Hand {
  private _cards: CardContainer[];

  private _playerNames: string[];

  private _currentTrick: Trick;

  constructor(shuffledCards: number[], playerNames: string[]) {
    this._cards = [];
    shuffledCards.map((value: number) => new CardContainer(value)).forEach(card => this._cards.push(card));
    this._playerNames = playerNames;
  }

  public getCards(playerName: string) {
    const playerIndex = this.getPlayersIndex(playerName);
    return this.cardsInPlayersHand(playerIndex).map(x => x.getCard().presentation());
  }

  public removeCard(playerName: string, rank: string, suit: string) {
    if (playerName !== this.getEldestHand()) {
      throw 403;
    }

    const playerIndex = this.getPlayersIndex(playerName);

    if (this.cardsInPlayersHand(playerIndex).length <= CARDS_IN_HAND) {
      throw 400;
    }

    this.getCardFromHand(playerIndex, rank, suit).setPlayed();
  }

  public getCurrentTrick(): any {
    if (!this._currentTrick) {
      throw 404;
    }

    return this._currentTrick.presentation();
  }

  public startTrick(playerName: string, rank: string, suit: string): any {
    // FIXME: check that player has removed enough cards
    if (this.isTrickOpen() ||
        playerName !== this.getTrickLead()) {
      throw 400;
    }

    const playerIndex = this.getPlayersIndex(playerName);
    const card = this.getCardFromHand(playerIndex, rank, suit);

    // TODO: add support for trump games.
    this._currentTrick = new Trick(card.getCard(), playerName);
    card.setPlayed();
    return this._currentTrick.presentation();
  }

  public addCardToTrick(playerName: string, rank: string, suit: string): any {
    if (!this._currentTrick) {
      throw 400;
    }

    const playerIndex = this.getPlayersIndex(playerName);
    if (!playerIndex || !this.hasPlayerTurn(playerIndex)) {
      throw 403;
    }

    const card = this.getCardFromHand(playerIndex, rank, suit);

    // TODO: check if card has correct suit

    this._currentTrick.playCard(card.getCard(), playerName);
    card.setPlayed();
    // TODO: if trick is ready update scores
    return this._currentTrick.presentation();
  }

  private getPlayersIndex(player: string): number {
    return this._playerNames.findIndex(x => x === player);
  }

  private getCardFromHand(playerIndex: number, rank: string, suit: string) {
    const card = this.cardsInPlayersHand(playerIndex).filter(x => x.getCard().equals(rank, suit))[0];
    if (!card) {
      throw 404;
    }
    return card;
  }

  private cardsInPlayersHand(player: number): CardContainer[] {
    return this._cards.filter((_val, index) => this.isPlayersCard(player, index)).filter(x => !x.isPlayed());
  }

  private isPlayersCard(player: number, index: number): boolean {
    return Math.trunc((index / CARDS_IN_HAND) % PLAYERS) === player;
  }

  private isTrickOpen(): boolean {
    if (!this._currentTrick) {
      return false;
    }

    return this._currentTrick.playedCards() < PLAYERS;
  }

  private getEldestHand(): string {
    return this._playerNames[0];
  }

  private getTrickLead(): string {
    if (this._currentTrick) {
      return this._currentTrick.getTaker();
    }

    return this.getEldestHand();
  }

  private hasPlayerTurn(index: number): boolean {
    const previousPlayerIndex = index - 1 >= 0 ? index - 1 : PLAYERS - 1;
    return this._playerNames[previousPlayerIndex] === this._currentTrick.getLatestPlayer();
  }

}
export { Hand };
