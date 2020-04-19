import { PlayersHand } from './PlayersHand';
import { ScoreBoard } from './ScoreBoard';
import { StatuteSummary } from './Statute';
import Trick from './Trick';
import { GameType } from '../../../../types/game-type';
import { HandStatute } from '../../../../types/hand-statute';
import { PlayerScore } from '../../../../types/player-score';
import * as React from 'react';

const TRICK = {
  cards: [
    {
      player: 'Vilho',
      card: {
        rank: '5',
        suit: '♣️',
      },
    },
    {
      player: 'Seija',
      card: {
        rank: '9',
        suit: '♥️',
      },
    },
    {
      player: 'Herkko',
      card: {
        rank: '10',
        suit: '♣️',
      },
    },
    {
      player: 'Raili',
      card: {
        rank: '2',
        suit: '♣️',
      },
    },
  ],
};

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

export const App = () => (
  <div>
    <Trick trick={TRICK} />
    <PlayersHand />
    <ScoreBoard scores={TOTAL_SCORE} />
    <StatuteSummary statute={STATUTE} />
  </div>
);
