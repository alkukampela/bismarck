import { GameType } from '../types/game-type';
import { Player } from '../types/player';
import { PlayerScore } from '../types/player-score';

export class HandScore {
  private _players: PlayerScore[];

  constructor(players: Player[]) {
    this._players = players.map((player) => {
      return { player, score: 0 } as PlayerScore;
    });
  }

  public takeTrick(player: Player): void {
    this._players
      .filter((score) => player.name === score.player.name)
      .forEach((x) => x.score++);
  }

  public getScores(gameType: GameType): PlayerScore[] {
    return this._players.map((trick) => {
      return {
        player: trick.player,
        score: this.countScore(trick, gameType),
      };
    });
  }

  private countScore(trick: PlayerScore, gameType: GameType): number {
    return this.isEldestHand(trick.player)
      ? this.countScoreForEldestHand(trick.score, gameType)
      : this.countScoreForNonEldestHand(trick.score, gameType);
  }

  private isEldestHand(player: Player): boolean {
    return player === this._players[0].player;
  }

  private countScoreForEldestHand(tricks: number, gameType: GameType): number {
    return gameType !== GameType.MISERE ? tricks - 6 : tricks * -1;
  }

  private countScoreForNonEldestHand(
    tricks: number,
    gameType: GameType
  ): number {
    return gameType !== GameType.MISERE ? tricks - 2 : 4 - tricks;
  }
}
