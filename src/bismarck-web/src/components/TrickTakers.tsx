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
    <div className="trick-takers">
      <h2>Tikit</h2>
      <table>
        <tbody>
          {trickTakers.map((playerScore: PlayerScore, index: number) => (
            <tr
              key={index}
              className={isMyScore(playerScore.player.name) ? 'my-score' : ''}
            >
              <td>{playerScore.player.name}: </td>
              <td className="score">{playerScore.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
