import { GameType } from '../../../types/game-type';
import { HandStatute } from '../../../types/hand-statute';
import { TrickResponse, TrickStatus } from '../../../types/trick-response';
import { SuitEnum } from '../../../types/suit';
import * as React from 'react';

export const HandTitle = ({
  handStatute,
  trickResponse,
}: {
  handStatute: HandStatute;
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
    switch (handStatute.handType.gameType?.value) {
      case GameType.MISERE:
        return 'Misääri';
      case GameType.NO_TRUMP:
        return 'Grandi';
      case GameType.TRUMP:
        return trumpGameTypeName(handStatute.handType.gameType?.trumpSuit);
    }
    return handStatute.handType.isChoice ? 'Valinta' : '';
  };

  const trickCounter = (): string => {
    if (
      trickResponse.trickStatus !== TrickStatus.HAND_NOT_STARTED &&
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
