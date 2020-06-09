import * as React from 'react';
import { HandStatute } from '../../../types/hand-statute';
import { GameType } from '../../../types/game-type';
import { Suit } from '../../../types/suit';

export const HandTitle = ({
  handStatute,
  trickNumber,
}: {
  handStatute: HandStatute;
  trickNumber?: number;
}) => {
  const gameMode = () => {
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
  };

  const trickCounter = () => {
    if (typeof trickNumber === 'number') {
      return `${trickNumber + 1}/${handStatute.tricks}`;
    }
  };

  return (
    <div>
      <h1>
        {gameMode()} {trickCounter()}
      </h1>
    </div>
  );
};
