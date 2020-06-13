import { GameScoreBoard } from '../../../types/game-score-board';
import * as React from 'react';

export const FinalScores = ({ scores }: { scores: GameScoreBoard }) => {
  const positionRomanNumber = (position: number): string => {
    return position < 4 ? 'I'.repeat(position) : 'IV';
  };

  const results = (): {
    player: string;
    points: number;
    position: string;
  }[] => {
    if (scores.trickScores.length === 0) {
      return [];
    }
    return scores.trickScores
      .slice(-1)[0]
      .scores.sort((a, b) => b.totalPoints - a.totalPoints)
      .map((score, index) => {
        return {
          player: score.player.name,
          points: score.totalPoints,
          // TODO: handle ties
          position: positionRomanNumber(index + 1),
        };
      });
  };

  return (
    <div
      style={{
        display: scores.isFinished ? 'block' : 'none',
      }}
      className="final-scores-container"
    >
      <h1>Lopputulokset</h1>
      <ul className="final-scores-list">
        {results().map((playerScore, index) => (
          <li key={index}>
            {playerScore.position}: {playerScore.player} {playerScore.points}
            {playerScore.position === 'I' && ' 🏆'}
          </li>
        ))}
      </ul>
    </div>
  );
};
