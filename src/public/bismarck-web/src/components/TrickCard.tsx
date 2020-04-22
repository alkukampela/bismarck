import * as React from 'react';
import { Card } from './Card';

import { TrickCard as TrickCardType } from '../../../../types/trick-cards';

export const TrickCard = ({
  trickCard: trickCard,
}: {
  trickCard: TrickCardType;
}) => {
  return (
    <div>
      {!!trickCard.card ? (
        <Card card={trickCard.card} />
      ) : (
        <div className="card empty-card" />
      )}
      <h2>{trickCard.player}</h2>
    </div>
  );
};
