import * as React from 'react';

interface GameContextInterface {
  gameId: string;
  player: string;
  token: string;
}

const context = React.createContext<GameContextInterface>({
  gameId: '',
  player: '',
  token: '',
});

export const GameContext = context;

export const GameContextProvider = context.Provider;
