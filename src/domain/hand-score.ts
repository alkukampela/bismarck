import { Player } from './player';
import { PlayerScore } from '../types/player-score';

export class HandScore {
  private _players: PlayerScore[];

  // TODO: add support for misere
  constructor(players: Player[]) {
    this._players = players.map((player) => {
      return { player: player.getName(), score: 0 } as PlayerScore;
    });
  }

  public takeTrick(player: Player): void {
    this._players
      .filter((score) => player.getName() === score.player)
      .forEach((x) => x.score++);
  }

  public getScores(): PlayerScore[] {
    return this._players.map((trick) => {
      return {
        player: trick.player,
        score: this.countScore(trick),
      };
    });
  }

  private countScore(trick: PlayerScore): number {
    return this.isEldestHand(trick.player)
      ? this.countScoreForEldestHand(trick.score)
      : this.countScoreForNonEldestHand(trick.score);
  }

  private isEldestHand(player: string): boolean {
    return player === this._players[0].player;
  }

  private countScoreForEldestHand(tricks: number): number {
    return tricks - 6;
  }
  private countScoreForNonEldestHand(tricks: number): number {
    return tricks - 2;
  }
}
