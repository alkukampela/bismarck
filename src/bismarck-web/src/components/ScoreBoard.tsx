import { OnGoingGameScore } from './OnGoingGameScore';
import { StatuteSummary } from './Statute';
import { TrickTakers } from './TrickTakers';
import { HandStatute } from '../../../types/hand-statute';
import { PlayerScore } from '../../../types/player-score';
import { GameScoreBoard } from '../../../types/game-score-board';
import * as React from 'react';

export const ScoreBoard = ({
  statute,
  trickTakers,
  scores,
}: {
  statute: HandStatute;
  trickTakers: PlayerScore[];
  scores: GameScoreBoard;
}) => {
  return (
    <div className="score-board">
      <StatuteSummary statute={statute} />
      <TrickTakers trickTakers={trickTakers} />
      <OnGoingGameScore scores={scores} />
    </div>
  );
};
