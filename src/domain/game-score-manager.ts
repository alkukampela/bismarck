import { Player } from './player';
import { GameScoreBoard } from '../types/game-score-board';
import { PlayerScore } from '../types/player-score';

export class GameScoreManager {
  private _scores: PlayerScore[][];

  constructor() {
    this._scores = [];
  }

  public getScoreBoard(): GameScoreBoard {
    return {
      trickScores: this._scores,
      totalScore: this.calculateScore(),
    };
  }

  public saveTrick(trickScores: PlayerScore[]) {
    this._scores.push(trickScores);
  }

  private calculateScore(): PlayerScore[] {
    const totals: PlayerScore[] = [];

    // TODO refactor this horrornous mess
    this._scores.forEach((x) =>
      x.forEach((y) => {
        totals.filter((z) => z.player === y.player).length === 0
          ? totals.push({ player: y.player, score: y.score })
          : (totals.filter((z) => z.player === y.player)[0].score += y.score);
      })
    );

    return totals;
  }
}
