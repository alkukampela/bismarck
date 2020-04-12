import { Player } from './player';

type PlayerScore = [Player, number];

export class HandScore {
  private _scores: PlayerScore[];

  // TODO: add support for misere
  constructor(players: Player[]) {
    this._scores = players.map((player) => [player, 0]);
  }

  public takeTrick(player: Player): void {
    this._scores
      .filter((score) => player.equals(score[0]))
      .forEach((x) => x[1]++);
  }

  public getScores() {
    const retVal = {};
    this._scores.forEach(
      (score) =>
        (retVal[score[0].getName()] = this.countScore(score[0], score[1]))
    );

    return retVal;
  }

  private countScore(player: Player, tricks: number): number {
    return this.isEldestHand(player)
      ? this.countScoreForEldestHand(tricks)
      : this.countScoreForNonEldestHand(tricks);
  }

  private isEldestHand(player: Player): boolean {
    return player.equals(this._scores[0][0]);
  }

  private countScoreForEldestHand(tricks: number): number {
    return tricks - 6;
  }
  private countScoreForNonEldestHand(tricks: number): number {
    return tricks - 2;
  }
}
