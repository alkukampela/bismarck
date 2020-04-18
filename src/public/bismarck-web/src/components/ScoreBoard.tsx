import * as React from 'react';

import { PlayerScore } from '../../../../types/player-score';

interface TotalScores {
  Scores: PlayerScore[];
}

export const ScoreBoard: React.FunctionComponent<TotalScores> = ({
  Scores,
}) => {
  return (
    <div className="scoreboard">
      <h1>Tilanne</h1>
      {Scores.map((value: PlayerScore, index: number) => (
        <div key={index}>
          {value.player}: {value.score}
        </div>
      ))}
    </div>
  );
};
