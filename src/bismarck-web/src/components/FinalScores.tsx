import { ScoreSheet } from './ScoreSheet';
import { GameScoreBoard } from '../../../types/game-score-board';
import { calculateFinalResults } from '../domain/score-calculators';
import * as React from 'react';

export const FinalScores = ({ scores }: { scores: GameScoreBoard }) => {
  return (
    <div
      style={{
        display: scores.isFinished ? 'block' : 'none',
      }}
      className="final-scores-container"
    >
      <h1>Lopputulokset</h1>
      <ul className="final-scores-list">
        {calculateFinalResults(scores.trickScores).map((playerScore, index) => (
          <li key={index}>
            {playerScore.position} {playerScore.player} {playerScore.points}
            {playerScore.position === 'I' && ' 🏆'}
          </li>
        ))}
      </ul>

      <ScoreSheet scores={scores} />
    </div>
  );
};
