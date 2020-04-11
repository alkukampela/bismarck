export class Player {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  public getName(): string {
    return this._name;
  }

  public equals(other: Player): boolean {
    return this._name === other.getName();
  }
}
