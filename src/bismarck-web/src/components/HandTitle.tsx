import { GameType } from '../../../types/game-type';
import { HandStatuteResponse } from '../../../types/hand-statute-response';
import { TrickResponse } from '../../../types/trick-response';
import { SuitEnum } from '../../../types/suit';
import * as React from 'react';

export const HandTitle = ({
  handStatute,
  trickResponse,
}: {
  handStatute: HandStatuteResponse;
  trickResponse: TrickResponse;
}): React.ReactElement => {
  const trumpGameTypeName = (trumpSuit: SuitEnum | undefined) => {
    switch (trumpSuit) {
      case SuitEnum.DIAMOND:
        return 'Ruutuvaltti';
      case SuitEnum.CLUB:
        return 'Ristivaltti';
      case SuitEnum.HEART:
        return 'Herttavaltti';
      case SuitEnum.SPADE:
        return 'Patavaltti';
      default:
        return 'Valtti';
    }
  };

  const gameModeName = (): string => {
    switch (handStatute.gameType?.value) {
      case GameType.MISERE:
        return 'Misääri';
      case GameType.NO_TRUMP:
        return 'Grandi';
      case GameType.TRUMP:
        return trumpGameTypeName(handStatute.gameType?.trumpSuit);
    }
    return handStatute.isChoice ? 'Valinta' : '';
  };

  const trickCounter = (): string => {
    if (
      trickResponse.trickStatus !== 'HAND_NOT_STARTED' &&
      !!trickResponse.trickNumber
    ) {
      return `${trickResponse.trickNumber + 1}/${handStatute.tricksInHand}`;
    }
    return '';
  };

  return (
    <>
      <h1>
        {gameModeName()} {trickCounter()}
      </h1>
    </>
  );
};
