import { PlayerScore } from '../../../types/player-score';
import { GameContext } from '../GameContext';
import * as React from 'react';

export const TrickTakers = ({
  trickTakers,
}: {
  trickTakers: PlayerScore[];
}) => {
  const game = React.useContext(GameContext);

  const isMyScore = (name: string): boolean => {
    return game.player === name;
  };

  return (
    <div>
      <h2>Tikit</h2>
      {trickTakers.map((playerScore: PlayerScore, index: number) => (
        <div
          key={index}
          className={isMyScore(playerScore.player.name) ? 'my-score' : ''}
        >
          <span>{playerScore.player.name}: </span>
          <span>{playerScore.score}</span>
        </div>
      ))}
    </div>
  );
};
