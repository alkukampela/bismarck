import { CardManager } from './card-manager';
import { HandScore } from './hand-score';
import { HandStatuteMachine } from './hand-statute-machine';
import { Player } from './player';
import { TrickEntity } from './trick-entity';
import { Card } from '../types/card';
import { HandStatute } from '../types/hand-statute';
import * as statuses from 'http-status-codes';
import { GameType } from '../types/game-type';
import { Suit } from '../types/suit';

export class HandEntity {
  private readonly PLAYERS = 4;
  private readonly CARDS_IN_HAND = 12;

  private _cardManager: CardManager;

  private _currentTrick: TrickEntity;

  private _handScore: HandScore;

  private _players: Player[];

  private _handStatute: HandStatute;

  constructor(defaulPlayerOrder: Player[], handNumber: number) {
    this._cardManager = new CardManager();

    this._handStatute = new HandStatuteMachine().getHandStatute(
      defaulPlayerOrder,
      handNumber,
      this._cardManager.getTrumpSuit()
    );

    this._players = this._handStatute.playerOrder.map(
      (name) => new Player(name)
    );
    this._handScore = new HandScore(this._players);
  }

  public getCards(player: Player): Card[] {
    return this._cardManager
      .getPlayersCards(this.getPlayersIndex(player))
      .map((card) => card.presentation());
  }

  public removeCard(player: Player, rank: string, suit: string) {
    if (!player.equals(this.getEldestHand())) {
      throw statuses.FORBIDDEN;
    }

    const playerIndex = this.getPlayersIndex(player);

    if (
      this._cardManager.getPlayersCards(playerIndex).length <=
      this.CARDS_IN_HAND
    ) {
      throw statuses.BAD_REQUEST;
    }

    this._cardManager.removeCard(rank, suit);
  }

  public getStatute(): HandStatute {
    return this._handStatute;
  }

  public chooseGameType(
    player: Player,
    chosenGameType: GameType,
    suit?: Suit
  ): HandStatute {
    if (
      !player.equals(this.getEldestHand()) ||
      !this._handStatute.handType.gameType.value
    ) {
      throw statuses.BAD_REQUEST;
    }

    // TODO check that suit is passed if game type is trump and not passed in other game types

    this._handStatute = new HandStatuteMachine().chooseGameType(
      this._handStatute,
      chosenGameType,
      suit
    );
    return this._handStatute;
  }

  public getCurrentTrick(): any {
    if (!this._currentTrick) {
      throw statuses.NOT_FOUND;
    }

    return this._currentTrick.presentation();
  }

  public startTrick(player: Player, rank: string, suit: string): any {
    // FIXME: check that player has removed enough cards
    if (
      this.isTrickOpen() ||
      !player.equals(this.getTrickLead()) ||
      !this._handStatute.handType.gameType.value
    ) {
      throw statuses.BAD_REQUEST;
    }

    const playerIndex = this.getPlayersIndex(player);
    const card = this._cardManager.getCardFromPlayersHand(
      playerIndex,
      rank,
      suit
    );

    if (!card) {
      throw statuses.BAD_REQUEST;
    }

    this._currentTrick = new TrickEntity(
      card,
      player,
      this._handStatute.handType.gameType.trumpSuit
    );
    this._cardManager.removeCard(rank, suit);
    return this._currentTrick.presentation();
  }

  public addCardToTrick(player: Player, rank: string, suit: string): any {
    if (!this._currentTrick) {
      throw statuses.BAD_REQUEST;
    }

    const playerIndex = this.getPlayersIndex(player);
    if (!playerIndex || !this.hasPlayerTurn(playerIndex)) {
      throw statuses.FORBIDDEN;
    }

    // TODO: check if card has correct suit

    const card = this._cardManager.getCardFromPlayersHand(
      playerIndex,
      rank,
      suit
    );

    this._currentTrick.playCard(card, player);
    this._cardManager.removeCard(rank, suit);

    if (this._currentTrick.playedCards() === this.PLAYERS) {
      this._handScore.takeTrick(this._currentTrick.getTaker());
    }

    return this._currentTrick.presentation();
  }

  private getPlayersIndex(player: Player): number {
    return this._players.findIndex((x) => player.equals(x));
  }

  private isTrickOpen(): boolean {
    if (!this._currentTrick) {
      return false;
    }

    return this._currentTrick.playedCards() < this.PLAYERS;
  }

  private getEldestHand(): Player {
    return this._players[0];
  }

  private getTrickLead(): Player {
    if (this._currentTrick) {
      return this._currentTrick.getTaker();
    }

    return this.getEldestHand();
  }

  private hasPlayerTurn(index: number): boolean {
    const previousPlayerIndex = index - 1 >= 0 ? index - 1 : this.PLAYERS - 1;
    return this._players[previousPlayerIndex].equals(
      this._currentTrick.getLatestPlayer()
    );
  }
}
