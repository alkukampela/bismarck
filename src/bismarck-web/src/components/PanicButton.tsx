import { GameContext } from '../GameContext';
import { initHand } from '../services/api-service';
import * as React from 'react';

export const PanicButton = () => {
  const game = React.useContext(GameContext);

  const gottaGetSomeAction = () => {
    initHand(game.gameId).finally(() => location.reload()); // <== Sad
  };

  return (
    <button
      type="button"
      onClick={gottaGetSomeAction}
      style={{ display: !!game.player ? 'block' : 'none' }}
    >
      Paniikki
    </button>
  );
};
