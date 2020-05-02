import * as React from 'react';
import * as TC from '../../../types/trick-cards';
import { TrickDisplay } from './TrickDisplay';
import { socket } from '../services/socket';

export const Trick = () => {
  const [cards, setCards] = React.useState<TC.TrickCards>({ cards: [] });

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
