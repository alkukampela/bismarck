import { GameScoreBoard } from '../../../types/game-score-board';
import { GameContext } from '../GameContext';
import * as React from 'react';
import { PlayerScore } from '../../../types/player-score';

export const TotalScore = () => {
  const game = React.useContext(GameContext);

  const emptyScores: GameScoreBoard = {
    trickScores: [],
    totalScore: [],
  };

  const fetchScores = async (): Promise<GameScoreBoard> => {
    const resp = await fetch(
      `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/score`,
      {
        mode: 'cors',
      }
    );
    return resp.ok ? ((await resp.json()) as GameScoreBoard) : emptyScores;
  };

  const [scores, setScores] = React.useState<GameScoreBoard>(emptyScores);

  React.useEffect(() => {
    setTimeout(() => {
      fetchScores()
        .then((takers) => setScores(takers))
        .catch();
    }, 3000);
  });

  return (
    <div>
      <h2>Tilanne</h2>
      {scores.totalScore.map((playerScore: PlayerScore, index: number) => (
        <div key={index}>
          <span>{playerScore.player.name}: </span>
          <span>{playerScore.score}</span>
        </div>
      ))}
    </div>
  );
};
