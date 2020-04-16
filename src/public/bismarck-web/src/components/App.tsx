import * as React from 'react';
import Trick from './Trick';
import PlayersHand from './PlayersHand';

const TRICK = {
  cards: [
    {
      player: 'Pauli',
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
      player: 'Keijo',
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

export const App = () => (
  <div>
    <Trick trick={TRICK} />
    <PlayersHand cards={CARDS} />
  </div>
);
