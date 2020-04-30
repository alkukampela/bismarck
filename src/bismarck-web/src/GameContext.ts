import * as React from 'react';

interface GameContextInterface {
  gameId: string;
  player: string;
}

const context = React.createContext<GameContextInterface>({
  gameId: '',
  player: '',
});

export const GameContext = context;

export const GameContextProvider = context.Provider;
