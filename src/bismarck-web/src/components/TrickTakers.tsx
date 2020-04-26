import * as React from 'react';
import { PlayerScore } from '../../../types/player-score';

export const TrickTakers = () => {
  const fetchScores = async function (): Promise<PlayerScore[]> {
    const resp = await fetch(
      `http://localhost:3001/api/hands/current/trick-count`,
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
      {trickTakers.map((playerScore: PlayerScore, index: number) => (
        <div key={index}>
          <span>{playerScore.player.name}: </span>
          <span>{playerScore.score}</span>
        </div>
      ))}
    </div>
  );
};
