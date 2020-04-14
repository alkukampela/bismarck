import { Player } from './player';

type PlayerTricks = {
  player: Player;
  tricks: number;
};

export class HandScore {
  private _players: PlayerTricks[];

  // TODO: add support for misere
  constructor(players: Player[]) {
    this._players = players.map((player) => {
      return { player, tricks: 0 } as PlayerTricks;
    });
  }

  public takeTrick(player: Player): void {
    this._players
      .filter((score) => player.equals(score.player))
      .forEach((x) => x.tricks++);
  }

  public getScores() {
    const retVal = {};
    this._players.forEach(
      (trick) => (retVal[trick.player.getName()] = this.countScore(trick))
    );

    return retVal;
  }

  private countScore(trick: PlayerTricks): number {
    return this.isEldestHand(trick.player)
      ? this.countScoreForEldestHand(trick.tricks)
      : this.countScoreForNonEldestHand(trick.tricks);
  }

  private isEldestHand(player: Player): boolean {
    return player.equals(this._players[0].player);
  }

  private countScoreForEldestHand(tricks: number): number {
    return tricks - 6;
  }
  private countScoreForNonEldestHand(tricks: number): number {
    return tricks - 2;
  }
}
