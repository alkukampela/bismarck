import { ReadOnlyCard } from './ReadOnlyCard';
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
        <ReadOnlyCard card={trickCard.card} />
      ) : (
        <div className="card empty-card" />
      )}
      <h2 className={isTaker ? 'taker' : ''}>{trickCard.player.name}</h2>
    </div>
  );
};
