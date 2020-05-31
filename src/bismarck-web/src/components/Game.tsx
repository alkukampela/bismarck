import { PanicButton } from './PanicButton';
import { GameContainer } from './GameContainer';
import { GameContextProvider as Provider } from '../GameContext';
import * as QueryString from 'query-string';
import * as React from 'react';

const parseQueryString = (key: string): string => {
  return (QueryString.parse(location.search)[key] as string) || '';
};

export const Game = () => {
  const gameId = parseQueryString('game');
  const player = sessionStorage.getItem(`player_${gameId}`) || '';
  const token = sessionStorage.getItem(`token_${gameId}`) || '';
  const game = { player, gameId, token };

  return (
    <Provider value={game}>
      <PanicButton />
      <GameContainer />
    </Provider>
  );
};
