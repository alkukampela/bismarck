import { Player } from './player';
import { PlayerScore } from '../types/player-score';
import { GameType } from '../types/game-type';

export class HandScore {
  private _players: PlayerScore[];
  private _gameType: GameType;

  constructor(players: Player[], gameType: GameType) {
    this._players = players.map((player) => {
      return { player: player.getName(), score: 0 } as PlayerScore;
    });
    this._gameType = gameType;
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
    return this._gameType !== GameType.MISERE ? tricks - 6 : tricks * -1;
  }
  private countScoreForNonEldestHand(tricks: number): number {
    return this._gameType !== GameType.MISERE ? tricks - 2 : 4 - tricks;
  }
}
