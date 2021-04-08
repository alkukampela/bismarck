import { GameContext } from '../GameContext';
import { initHand } from '../services/api-service';
import * as React from 'react';

export const PanicButton = () => {
  const game = React.useContext(GameContext);

  const gottaGetSomeAction = () => {
    initHand(game.token, game.gameId).finally(() => location.reload());
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
