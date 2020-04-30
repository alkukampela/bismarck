import { PlayerScore } from '../../../types/player-score';
import GameContext from '../GameContext';
import * as React from 'react';

export const TrickTakers = () => {
  const game = React.useContext(GameContext);

  const fetchScores = async (): Promise<PlayerScore[]> => {
    const resp = await fetch(
      `http://localhost:3001/api/games/${game.gameId}/hand/trick-count`,
      {
        mode: 'cors',
      }
    );
    return resp.ok ? ((await resp.json()) as PlayerScore[]) : [];
  };

  const [trickTakers, setTrickTakers] = React.useState<PlayerScore[]>([]);

  React.useEffect(() => {
    setTimeout(() => {
      fetchScores()
        .then((takers) => setTrickTakers(takers))
        .catch();
    }, 1000);
  });

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
