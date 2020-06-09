import { GameScoreBoard } from '../../../types/game-score-board';
import { TrickScore } from '../../../types/trick-score';
import * as React from 'react';

interface PlayerCumulativeScore {
  name: string;
  points: number[];
}

interface PlayerPoints {
  name: string;
  totalPoints: number;
}

export const TotalScore = ({ scores }: { scores: GameScoreBoard }) => {
  const [cumulativeScores, setCumulativeScores] = React.useState<
    PlayerCumulativeScore[]
  >([]);

  const convertToCumulativeScores = (
    trickScores: TrickScore[]
  ): PlayerCumulativeScore[] => {
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

  const classNameFrom = (trick: TrickScore): string => {
    if (trick.isChoice) {
      return 'choice';
    }
    return trick.gameType.toLowerCase();
  };

  React.useEffect(() => {
    setCumulativeScores(convertToCumulativeScores(scores.trickScores));
  }, [scores]);

  return (
    <div>
      <h2>Tilanne</h2>

      <table className="score-sheet">
        <thead>
          <tr>
            {cumulativeScores.map((score) => {
              return <th key={`column-${score.name}`}>{score.name}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {scores.trickScores.map((trick, trickIndex) => {
            return (
              <tr key={trickIndex} className={classNameFrom(trick)}>
                {cumulativeScores.map((score, scoreIndex) => {
                  return (
                    <td key={`${scoreIndex}-${trickIndex}`}>
                      {score.points[trickIndex]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
