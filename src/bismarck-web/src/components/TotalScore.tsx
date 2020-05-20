import { GameScoreBoard } from '../../../types/game-score-board';
import { PlayerScore } from '../../../types/player-score';
import * as React from 'react';

export const TotalScore = ({ scores }: { scores: GameScoreBoard }) => {
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
