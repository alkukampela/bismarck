import * as React from 'react';

import { PlayerScore } from '../../../../types/player-score';

interface TotalScores {
  scores: PlayerScore[];
}

export const ScoreBoard: React.FunctionComponent<TotalScores> = ({
  scores,
}) => {
  return (
    <div className="scoreboard">
      <h1>Tilanne</h1>
      {scores.map((value: PlayerScore, index: number) => (
        <div key={index}>
          {value.player.name}: {value.score}
        </div>
      ))}
    </div>
  );
};
