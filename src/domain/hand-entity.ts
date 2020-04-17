import * as statuses from 'http-status-codes';

import { TrickEntity } from './trick-entity';
import { Player } from './player';
import { HandScore } from './hand-score';
import { Card } from '../types/card';
import { GameType } from '../types/game-type';
import { CardManager } from './card-manager';

export class HandEntity {
  private readonly PLAYERS = 4;
  private readonly CARDS_IN_HAND = 12;

  private _cardManager: CardManager;

  private _players: Player[];

  private _currentTrick: TrickEntity;

  private _handScore: HandScore;

  constructor(players: Player[]) {
    // TODO: maybe not init from param but use service
    this._cardManager = new CardManager();
    this._players = players;
    // TODO: use correct game type
    this._handScore = new HandScore(players, GameType.TRUMP);
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

  public getCurrentTrick(): any {
    if (!this._currentTrick) {
      throw statuses.NOT_FOUND;
    }

    return this._currentTrick.presentation();
  }

  public startTrick(player: Player, rank: string, suit: string): any {
    // FIXME: check that player has removed enough cards
    if (this.isTrickOpen() || !player.equals(this.getTrickLead())) {
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

    // TODO: add support for trump games.
    this._currentTrick = new TrickEntity(card, player);
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
