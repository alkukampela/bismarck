import { PlayersHand } from './PlayersHand';
import { ScoreBoard } from './ScoreBoard';
import { StatuteSummary } from './Statute';
import { Trick } from './Trick';
import { TrickTakers } from './TrickTakers';
import { PlayerScore } from '../../../types/player-score';
import * as QueryString from 'query-string';
import * as React from 'react';

const TOTAL_SCORE: PlayerScore[] = [
  { player: { name: 'Vilho' }, score: 3 },
  { player: { name: 'Seija' }, score: 2 },
  { player: { name: 'Herkko' }, score: -2 },
  { player: { name: 'Raili' }, score: -3 },
];

export const App = () => {
  const player = (QueryString.parse(location.search).player as string) || '';
  return (
    <div>
      <Trick />
      <PlayersHand player={player} />
      <StatuteSummary />
      <TrickTakers />
      <ScoreBoard scores={TOTAL_SCORE} />
    </div>
  );
};
