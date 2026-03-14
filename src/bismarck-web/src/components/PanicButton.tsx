import { ApiContext } from '../ApiContext';
import { GameContext } from '../GameContext';
import * as React from 'react';

export const PanicButton = () => {
  const game = React.useContext(GameContext);
  const api = React.useContext(ApiContext).api;

  const gottaGetSomeAction = () => {
    api.initHand(game.token, game.gameId).finally(() => location.reload());
  };

  const showButton = (): boolean => {
    return !!game.player || !!game.token;
  };

  return (
    <button
      type="button"
      onClick={gottaGetSomeAction}
      className="panic-button"
      style={{ display: showButton() ? 'block' : 'none' }}
    >
      Paniikki
    </button>
  );
};
