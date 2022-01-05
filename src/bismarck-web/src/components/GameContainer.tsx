import { Game } from './Game';
import { HelpButton } from './HelpButton';
import { StartScreen } from './StartScreen';
import { extractGameId } from '../services/game-id-extractor';
import { GameContextProvider as Provider } from '../GameContext';
import * as React from 'react';

export const GameContainer = () => {
  const gameId = extractGameId(document);
  const player = sessionStorage.getItem(`player_${gameId}`) || '';
  const token = sessionStorage.getItem(`token_${gameId}`) || '';
  const game = { player, gameId, token };

  return (
    <>
      <Provider value={game}>
        {!!gameId && <Game />}
        {!gameId && <StartScreen />}
      </Provider>
      <HelpButton />
    </>
  );
};
