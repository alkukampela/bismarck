import { GameScoreBoard } from '../../../types/game-score-board';
import { PlayerCumulativeScore } from '../domain/player-cumulative-score';
import { trickScoresToCumulativeScores } from '../domain/score-calculators';
import * as React from 'react';

export const ScoreSheet = ({ scores }: { scores: GameScoreBoard }) => {
  const [cumulativeScores, setCumulativeScores] = React.useState<
    PlayerCumulativeScore[]
  >([]);

  React.useEffect(() => {
    setCumulativeScores(trickScoresToCumulativeScores(scores.trickScores));
  }, [scores]);

  return (
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
            <tr
              key={trickIndex}
              className={
                Math.floor(trickIndex / trick.scores.length) % 2 === 0
                  ? 'odd-gametype'
                  : 'even-gametype'
              }
            >
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
  );
};
