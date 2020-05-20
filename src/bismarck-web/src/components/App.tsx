import { PanicButton } from './PanicButton';
import { GameContainer } from './GameContainer';
import { GameContextProvider as Provider } from '../GameContext';
import * as QueryString from 'query-string';
import * as React from 'react';

export const App = () => {
  const player = (QueryString.parse(location.search).player as string) || '';
  const gameId = (QueryString.parse(location.search).game as string) || '';
  const game = { player, gameId };

  return (
    <Provider value={game}>
      <PanicButton />
      <GameContainer />
    </Provider>
  );
};
