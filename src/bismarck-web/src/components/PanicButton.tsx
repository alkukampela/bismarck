import { GameContext } from '../GameContext';
import * as React from 'react';

export const PanicButton = () => {
  const game = React.useContext(GameContext);

  const initHand = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    }).finally(() => location.reload()); // <== Sad
  };

  return (
    <button
      type="button"
      onClick={initHand}
      className="panic-button"
      style={{ display: !!game.player ? 'block' : 'none' }}
    >
      Paniikki
    </button>
  );
};
