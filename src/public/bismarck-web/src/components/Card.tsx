import * as React from 'react';

import { Card as CardType } from '../../../../types/card';

export const Card = ({ card, player }: { card: CardType; player?: string }) => {
  const [showCard, setState] = React.useState<boolean>(true);

  const getCardClass = (suit: string) => {
    return `card ${['♦️', '♥️'].includes(suit) ? 'red-card' : 'black-card'}`;
  };

  const tryEverything = () => {
    if (!player) {
      return;
    }
    // TODO: call all possible api endpoints
    setState(false);
  };

  return showCard ? (
    <div className={getCardClass(card.suit)} onClick={tryEverything}>
      <div className="suit">{card.suit}</div>
      <div className="rank">{card.rank}</div>
    </div>
  ) : (
    <div />
  );
};
