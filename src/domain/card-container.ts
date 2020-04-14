import { CardEntity } from './card-entity';

export class CardContainer {
  private _card: CardEntity;

  private _isPlayed: boolean;

  constructor(value: number) {
    this._card = new CardEntity(value);
    this._isPlayed = false;
  }

  public getCard(): CardEntity {
    return this._card;
  }

  public isPlayed(): boolean {
    return this._isPlayed;
  }

  public setPlayed(): void {
    this._isPlayed = true;
  }
}
