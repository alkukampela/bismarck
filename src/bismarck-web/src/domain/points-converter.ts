import { PlayerCumulativeScore } from './player-cumulative-score';
import { TrickScore } from '../../../types/trick-score';

export const trickScoresToCumulativeScores = (
  trickScores: TrickScore[]
): PlayerCumulativeScore[] => {
  interface PlayerPoints {
    name: string;
    totalPoints: number;
  }

  const allTricksPoints: PlayerPoints[] = Array.prototype.concat.apply(
    [],
    trickScores.map((trickScore) => {
      return trickScore.scores.map((playerPoints) => {
        return {
          name: playerPoints.player.name,
          totalPoints: playerPoints.totalPoints,
        } as PlayerPoints;
      });
    })
  );

  return allTricksPoints.reduce(
    (
      accumulator: PlayerCumulativeScore[],
      currentValue: PlayerPoints
    ): PlayerCumulativeScore[] => {
      const playersPoints = accumulator.find(
        (score: { name: string }) => score.name === currentValue.name
      );

      if (!!playersPoints) {
        playersPoints.points.push(currentValue.totalPoints);
      } else {
        {
          accumulator.push({
            name: currentValue.name,
            points: [currentValue.totalPoints],
          });
        }
      }

      return accumulator;
    },
    []
  );
};
