import * as React from 'react';
import Trick from './Trick';
import PlayersHand from './PlayersHand';
import { PlayerScore } from '../../../../types/player-score';
import ScoreBoard from './ScoreBoard';

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

const CARDS = [
  {
    rank: 'J',
    suit: '♣️',
  },
  {
    rank: '3',
    suit: '♣️',
  },
  {
    rank: '8',
    suit: '♠️',
  },
  {
    rank: '8',
    suit: '♣️',
  },
  {
    rank: '2',
    suit: '♠️',
  },
  {
    rank: '5',
    suit: '♦️',
  },
  {
    rank: '4',
    suit: '♦️',
  },
  {
    rank: 'J',
    suit: '♦️',
  },
  {
    rank: '2',
    suit: '♦️',
  },
  {
    rank: 'J',
    suit: '♠️',
  },
  {
    rank: 'Q',
    suit: '♣️',
  },
  {
    rank: '3',
    suit: '♦️',
  },
  {
    rank: '4',
    suit: '♥️',
  },
  {
    rank: 'K',
    suit: '♣️',
  },
  {
    rank: '7',
    suit: '♦️',
  },
];

const TOTAL_SCORE: PlayerScore[] = [
  { player: 'Vilho', score: 3 },
  { player: 'Seija', score: 2 },
  { player: 'Herkko', score: -2 },
  { player: 'Raili', score: -3 },
];

export const App = () => (
  <div>
    <Trick trick={TRICK} />
    <PlayersHand cards={CARDS} />
    <ScoreBoard totalScore={TOTAL_SCORE} />
  </div>
);
