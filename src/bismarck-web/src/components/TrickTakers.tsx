import { PlayerScore } from '../../../types/player-score';
import * as React from 'react';

export const TrickTakers = ({
  trickTakers: trickTakers,
}: {
  trickTakers: PlayerScore[];
}) => {
  return (
    <div>
      <h2>Tikit</h2>
      {trickTakers.map((playerScore: PlayerScore, index: number) => (
        <div key={index}>
          <span>{playerScore.player.name}: </span>
          <span>{playerScore.score}</span>
        </div>
      ))}
    </div>
  );
};
