import { Card as CardType } from '../../../types/card';
import * as React from 'react';

export const ReadOnlyCard = ({ card }: { card: CardType }) => {
  // TODO move somwhere else
  const getCardClass = (suit: string) => {
    return `card ${['♦️', '♥️'].includes(suit) ? 'red-card' : 'black-card'}`;
  };

  return (
    <div className={getCardClass(card.suit)}>
      <div className="suit">{card.suit}</div>
      <div className="rank">{card.rank}</div>
    </div>
  );
};
