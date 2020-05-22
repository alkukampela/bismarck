import { PanicButton } from './PanicButton';
import { GameContainer } from './GameContainer';
import { GameContextProvider as Provider } from '../GameContext';
import * as QueryString from 'query-string';
import * as React from 'react';

const parseQueryString = (key: string): string => {
  return (QueryString.parse(location.search)[key] as string) || '';
};

export const App = () => {
  const player = parseQueryString('player');
  const gameId = parseQueryString('game');
  const game = { player, gameId };

  return (
    <Provider value={game}>
      <PanicButton />
      <GameContainer />
    </Provider>
  );
};
