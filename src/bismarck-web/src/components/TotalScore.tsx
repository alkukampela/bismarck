import { ScoreSheet } from './ScoreSheet';
import { GameScoreBoard } from '../../../types/game-score-board';
import * as React from 'react';

export const TotalScore = ({ scores }: { scores: GameScoreBoard }) => {
  return (
    <>
      <h2>Tilanne</h2>
      <ScoreSheet scores={scores} />
    </>
  );
};
