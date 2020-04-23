import { PlayersHand } from './PlayersHand';
import { ScoreBoard } from './ScoreBoard';
import { StatuteSummary } from './Statute';
import { Trick } from './Trick';
import { GameType } from '../../../../types/game-type';
import { HandStatute } from '../../../../types/hand-statute';
import { PlayerScore } from '../../../../types/player-score';
import * as React from 'react';
import * as QueryString from 'query-string';

const TOTAL_SCORE: PlayerScore[] = [
  { player: 'Vilho', score: 3 },
  { player: 'Seija', score: 2 },
  { player: 'Herkko', score: -2 },
  { player: 'Raili', score: -3 },
];

const STATUTE: HandStatute = {
  handType: {
    isChoice: false,
    gameType: {
      value: GameType.NO_TRUMP,
    },
  },
  playerOrder: ['Vilho', 'Seija', 'Herkko', 'Raili'],
};

export const App = () => {
  const player = (QueryString.parse(location.search).player as string) || 'a';
  return (
    <div>
      <Trick />
      <PlayersHand player={player} />
      <ScoreBoard scores={TOTAL_SCORE} />
      <StatuteSummary statute={STATUTE} />
    </div>
  );
};
