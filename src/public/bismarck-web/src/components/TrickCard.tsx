import * as React from 'react';
import { Card } from './Card';

import { Card as CardType } from '../../../../types/card';

interface TrickCardType {
  player: String;
  card: CardType;
}

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
      <h1>{trickCard.player}</h1>
    </div>
  );
};
