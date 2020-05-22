import { GameContext } from '../GameContext';
import * as React from 'react';
import { initHand } from '../services/api-service';

export const PanicButton = () => {
  const game = React.useContext(GameContext);

  const gottaGetSomeAction = () => {
    initHand(game.gameId).finally(() => location.reload()); // <== Sad
  };

  return (
    <button
      type="button"
      onClick={gottaGetSomeAction}
      className="panic-button"
      style={{ display: !!game.player ? 'block' : 'none' }}
    >
      Paniikki
    </button>
  );
};
