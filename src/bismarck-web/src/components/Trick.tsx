import { TrickDisplay } from './TrickDisplay';
import * as TC from '../../../types/trick-cards';
import { GameContext } from '../GameContext';
import { SocketFactory } from '../services/socket-factory';
import * as React from 'react';

export const Trick = () => {
  const game = React.useContext(GameContext);

  const [cards, setCards] = React.useState<TC.TrickCards>({ cards: [] });
  const socket = SocketFactory.getSocket(game.gameId);

  React.useEffect(() => {
    socket.onmessage = (msg) => {
      const trick = JSON.parse(msg.data);
      setCards(trick);
    };
  });

  React.useEffect(() => () => socket.close(), [socket]);

  return (
    <div>
      <TrickDisplay trickCards={cards} />
    </div>
  );
};
