import { GameType } from '../../../types/game-type';
import { HandStatute } from '../../../types/hand-statute';
import { Suit } from '../../../types/suit';
import * as React from 'react';

export const HandTitle = ({
  handStatute,
  trickNumber,
}: {
  handStatute: HandStatute;
  trickNumber?: number;
}) => {
  const gameMode = (): string => {
    switch (handStatute.handType.gameType?.value) {
      case GameType.MISERE:
        return 'Misääri';
      case GameType.NO_TRUMP:
        return 'Grandi';
      case GameType.TRUMP:
        switch (handStatute.handType.gameType.trumpSuit) {
          case Suit.DIAMOND:
            return 'Ruutuvaltti';
          case Suit.CLUB:
            return 'Ristivaltti';
          case Suit.HEART:
            return 'Herttavaltti';
          case Suit.SPADE:
            return 'Patavaltti';
        }
    }
    return '-';
  };

  const trickCounter = (): string => {
    if (typeof trickNumber === 'number') {
      return `${trickNumber + 1}/${handStatute.tricks}`;
    }
    return '';
  };

  return (
    <div>
      <h1>
        {gameMode()} {trickCounter()}
      </h1>
    </div>
  );
};
