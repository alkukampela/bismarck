import { GameType } from '../../../types/game-type';
import { HandStatute } from '../../../types/hand-statute';
import { Suit } from '../../../types/suit';
import * as React from 'react';

export const StatuteSummary = ({ statute }: { statute: HandStatute }) => {
  const gameTypeName = (type: GameType): string => {
    switch (type) {
      case GameType.TRUMP:
        return 'Valtti';
      case GameType.NO_TRUMP:
        return 'Grandi';
      case GameType.MISERE:
        return 'Misääri';
      default:
        return '';
    }
  };

  const trumpSuitName = (trumpSuit: Suit): string => {
    switch (trumpSuit) {
      case Suit.DIAMOND:
        return 'Ruutu';
      case Suit.CLUB:
        return 'Risti';
      case Suit.HEART:
        return 'Hertta';
      case Suit.SPADE:
        return 'Pata';
      default:
        return '';
    }
  };

  return (
    <div className="statute">
      <h2>Käsi</h2>
      <div>Etumies: {statute.eldestHand.name}</div>
      {statute.handType.isChoice && <div>Valinta</div>}
      {statute.handType.gameType && (
        <div>{gameTypeName(statute.handType.gameType.value)}</div>
      )}
      {typeof statute.handType.gameType?.trumpSuit !== 'undefined' && (
        <div>{trumpSuitName(statute.handType.gameType.trumpSuit)}</div>
      )}
    </div>
  );
};
