import { ReadOnlyCard } from './ReadOnlyCard';
import { TrickCard as TrickCardType } from '../../../types/trick-cards';
import * as React from 'react';

export const TrickCard = ({
  trickCard: trickCard,
}: {
  trickCard: TrickCardType;
}) => {
  return (
    <div className="trick-card-container">
      {!!trickCard.card ? (
        <ReadOnlyCard card={trickCard.card} />
      ) : (
        <div className="card empty-card" />
      )}
      <h2>{trickCard.player.name}</h2>
    </div>
  );
};
