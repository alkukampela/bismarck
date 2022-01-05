import { TrickCard } from './TrickCard';
import { TrickCard as TC } from '../../../types/trick-card';
import { TrickResponse } from '../../../types/trick-response';
import * as CSS from 'csstype';
import * as React from 'react';

export const Trick = ({
  trickResponse,
  show,
}: {
  trickResponse: TrickResponse;
  show: boolean;
}) => {
  const getStyle = (show: boolean, numberOfCards: number): CSS.Properties => {
    return {
      display: show ? 'block' : 'none',
      columnCount: numberOfCards,
    };
  };

  const isTaker = (playerCard: TC): boolean => {
    return (
      !!trickResponse.taker &&
      trickResponse.taker.name === playerCard.player.name
    );
  };

  return (
    <div className="trick" style={getStyle(show, trickResponse.cards.length)}>
      {trickResponse.cards.map((playerCard: TC, index: number) => (
        <TrickCard
          trickCard={playerCard}
          key={index}
          isTaker={isTaker(playerCard)}
        />
      ))}
    </div>
  );
};
