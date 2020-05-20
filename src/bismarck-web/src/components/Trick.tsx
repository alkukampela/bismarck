import { TrickCard } from './TrickCard';
import * as TC from '../../../types/trick-cards';
import * as CSS from 'csstype';
import * as React from 'react';

export const Trick = ({
  trickCards: trickCards,
}: {
  trickCards: TC.TrickCards;
}) => {
  const getColumns = (numberOfCards: number): CSS.Properties => {
    return { columnCount: numberOfCards };
  };

  return (
    <div className="trick" style={getColumns(trickCards.cards.length)}>
      {trickCards.cards.map((playerCard: TC.TrickCard, index: number) => (
        <TrickCard trickCard={playerCard} key={index} />
      ))}
    </div>
  );
};
