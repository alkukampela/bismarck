import { PlayersHand } from './PlayersHand';
import { ScoreBoard } from './ScoreBoard';
import { StatuteSummary } from './Statute';
import { Trick } from './Trick';
import { GameType } from '../../../types/game-type';
import { HandStatute } from '../../../types/hand-statute';
import { PlayerScore } from '../../../types/player-score';
import * as React from 'react';
import * as QueryString from 'query-string';

const TOTAL_SCORE: PlayerScore[] = [
  { player: { name: 'Vilho' }, score: 3 },
  { player: { name: 'Seija' }, score: 2 },
  { player: { name: 'Herkko' }, score: -2 },
  { player: { name: 'Raili' }, score: -3 },
];

const STATUTE: HandStatute = {
  handType: {
    isChoice: false,
    gameType: {
      value: GameType.NO_TRUMP,
    },
  },
  playerOrder: [
    { name: 'Vilho' },
    { name: 'Seija' },
    { name: 'Herkko' },
    { name: 'Raili' },
  ],
  eldestHand: { name: 'Vilho' },
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
