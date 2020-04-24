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
    this._scores.forEach((trickScore) =>
      trickScore.forEach((playerTrick) => {
        totals.filter(
          (playerTotal) => playerTotal.player === playerTrick.player
        ).length === 0
          ? totals.push({
              player: playerTrick.player,
              score: playerTrick.score,
            })
          : (totals.filter((z) => z.player === playerTrick.player)[0].score +=
              playerTrick.score);
      })
    );

    return totals;
  }
}
