import { TrickCard } from './TrickCard';
import * as TC from '../../../types/trick-cards';
import * as React from 'react';

export const TrickDisplay = ({
  trickCards: trickCards,
}: {
  trickCards: TC.TrickCards;
}) => {
  return (
    <div className="trick">
      {trickCards.cards.map((playerCard: TC.TrickCard, index: number) => (
        <TrickCard trickCard={playerCard} key={index} />
      ))}
    </div>
  );
};
