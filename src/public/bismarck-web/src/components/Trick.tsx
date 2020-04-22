import * as React from 'react';
import { TrickCard } from './TrickCard';
import { TrickCards as TrickCardsType } from '../../../../types/trick-cards';

export const Trick = ({
  trickCards: trickCards,
}: {
  trickCards: TrickCardsType;
}) => {
  return (
    <div className="trick">
      {trickCards.cards.map((playerCard: any, index: number) => (
        <TrickCard trickCard={playerCard} key={index} />
      ))}
    </div>
  );
};
