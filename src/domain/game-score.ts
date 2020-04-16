import { PlayerScore } from '../types/player-score';
import { Player } from './player';
import { GameStatus } from '../types/game-status';

export class GameScore {
  private scores: PlayerScore[];
  private tricks: number;

  constructor(players: Player[]) {
    this.scores = players.map((p) => {
      return { player: p.getName(), score: 0 };
    });
    this.tricks = 0;
  }

  public getStatus(): GameStatus {
    return {
      scores: this.scores.sort((a, b) => a.score - b.score),
      tricks: this.tricks,
    };
  }

  public saveTrick(trickScores: PlayerScore[]) {
    this.tricks++;
    this.scores.forEach((x) => (x.score = this.calculateScore(x, trickScores)));
  }

  private calculateScore(
    currentScore: PlayerScore,
    trickScores: PlayerScore[]
  ): number {
    return (
      currentScore.score +
      trickScores.filter(
        (trickScore) => trickScore.player === currentScore.player
      )[0].score
    );
  }
}
