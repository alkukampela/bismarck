import { Card } from './Card';
import { EmptyCard } from './EmptyCard';
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
        <EmptyCard />
      )}
      <h2 className={isTaker ? 'taker' : ''}>{trickCard.player.name}</h2>
    </div>
  );
};
