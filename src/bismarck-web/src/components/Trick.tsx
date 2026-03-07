import { TrickCard } from './TrickCard';
import { TrickCard as TC } from '../../../types/trick-card';
import { TrickResponse } from '../../../types/trick-response';
import * as React from 'react';
import { CSSProperties } from 'react';

export const Trick = ({
  trickResponse,
  show,
}: {
  trickResponse: TrickResponse;
  show: boolean;
}): React.ReactElement => {
  const getStyle = (): CSSProperties => {
    return {
      display: show ? 'flex' : 'none',
    };
  };

  const isTaker = (playerCard: TC): boolean => {
    return (
      !!trickResponse.taker &&
      trickResponse.taker.name === playerCard.player.name
    );
  };

  return (
    <div className="trick" style={getStyle()}>
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
