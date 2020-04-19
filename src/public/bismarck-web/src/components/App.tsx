import * as React from 'react';
import Trick from './Trick';
import { PlayersHand } from './PlayersHand';
import { PlayerScore } from '../../../../types/player-score';
import { ScoreBoard } from './ScoreBoard';

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

export const App = () => (
  <div>
    <Trick trick={TRICK} />
    <PlayersHand />
    <ScoreBoard Scores={TOTAL_SCORE} />
  </div>
);
