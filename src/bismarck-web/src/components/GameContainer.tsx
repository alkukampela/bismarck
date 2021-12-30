import { Game } from './Game';
import { PanicButton } from './PanicButton';
import { StartScreen } from './StartScreen';
import { GameContextProvider as Provider } from '../GameContext';
import * as React from 'react';

export const GameContainer = () => {
  const params = new URLSearchParams(document.location.search);
  const gameId = params.get('game') || '';
  const player = sessionStorage.getItem(`player_${gameId}`) || '';
  const token = sessionStorage.getItem(`token_${gameId}`) || '';
  const game = { player, gameId, token };

  return (
    <Provider value={game}>
      <PanicButton />
      {!!gameId && <Game />}
      {!gameId && <StartScreen />}
    </Provider>
  );
};
