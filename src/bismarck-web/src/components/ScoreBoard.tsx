import { OnGoingGameScore } from './OnGoingGameScore';
import { StatuteSummary } from './StatuteSummary';
import { TrickTakers } from './TrickTakers';
import { HandStatuteResponse } from '../../../types/hand-statute-response';
import { PlayerScore } from '../../../types/player-score';
import { GameScoreBoard } from '../../../types/game-score-board';
import * as React from 'react';
import { TrickResponse } from '../../../types/trick-response';

export const ScoreBoard = ({
  statute,
  trickTakers,
  scores,
  trick,
  isMyTurn,
}: {
  statute: HandStatuteResponse;
  trickTakers: PlayerScore[];
  scores: GameScoreBoard;
  trick: TrickResponse;
  isMyTurn: boolean;
}): React.ReactElement => {
  return (
    <div className="score-board">
      <StatuteSummary statute={statute} trick={trick} isMyTurn={isMyTurn} />
      <TrickTakers trickTakers={trickTakers} />
      <OnGoingGameScore scores={scores} />
    </div>
  );
};
