import * as React from 'react';
import { Toggle } from './Toggle';
import Trick from './Trick';

const TRICK = {
  hei: 'dee',
  cards: [
    {
      player: 'a',
      card: {
        rank: '5',
        suit: '♣️',
      },
    },
    {
      player: 'b',
      card: {
        rank: '9',
        suit: '♥️',
      },
    },
  ],
};
export const App = () => (
  <div>
    <Trick trick={TRICK} />
    <Toggle onToggle={on => console.log('on: ', on)}>
      <Toggle.On>The button is on</Toggle.On>
      <Toggle.Off>The button is off</Toggle.Off>
      <Toggle.Button />
    </Toggle>
  </div>
);
