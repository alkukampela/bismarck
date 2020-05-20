import { TrickCard } from './TrickCard';
import { TrickCard as TC } from '../../../types/trick-card';
import { TrickCards } from '../../../types/trick-cards';
import * as CSS from 'csstype';
import * as React from 'react';

export const Trick = ({
  trickCards: trickCards,
}: {
  trickCards: TrickCards;
}) => {
  const getColumns = (numberOfCards: number): CSS.Properties => {
    return { columnCount: numberOfCards };
  };

  const isTaker = (playerCard: TC): boolean => {
    return (
      !!trickCards.taker && trickCards.taker.name === playerCard.player.name
    );
  };

  return (
    <div className="trick" style={getColumns(trickCards.cards.length)}>
      {trickCards.cards.map((playerCard: TC, index: number) => (
        <TrickCard
          trickCard={playerCard}
          key={index}
          isTaker={isTaker(playerCard)}
        />
      ))}
    </div>
  );
};
