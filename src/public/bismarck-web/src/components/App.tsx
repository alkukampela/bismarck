import * as React from 'react';
import Trick from './Trick';

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
export const App = () => (
  <div>
    <Trick trick={TRICK} />
  </div>
);
