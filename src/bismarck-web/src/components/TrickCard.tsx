import { Card } from './Card';
import { TrickCard as TrickCardType } from '../../../types/trick-card';
import * as React from 'react';

export const TrickCard = ({
  trickCard,
  isTaker,
}: {
  trickCard: TrickCardType;
  isTaker: boolean;
}) => {
  return (
    <div className="trick-card-container">
      {!!trickCard.card ? (
        <Card card={trickCard.card} />
      ) : (
        <div className="card empty-card" />
      )}
      <h2 className={isTaker ? 'taker' : ''}>{trickCard.player.name}</h2>
    </div>
  );
};
