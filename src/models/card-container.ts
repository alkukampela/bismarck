import { Card } from './card';

export class CardContainer {
  private _card: Card;

  private _isPlayed: boolean;

  constructor(value: number) {
    this._card = new Card(value);
    this._isPlayed = false;
  }

  public getCard(): Card {
    return this._card;
  }

  public isPlayed(): boolean {
    return this._isPlayed;
  }

  public setPlayed(): void {
    this._isPlayed = true;
  }
}
