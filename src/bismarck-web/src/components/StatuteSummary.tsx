import { GameType } from '../../../types/game-type';
import { HandStatute } from '../../../types/hand-statute';
import { Suit } from '../../../types/suit';
import * as React from 'react';

export const StatuteSummary = ({ statute }: { statute: HandStatute }) => {
  const gameTypeName = (type: GameType): string => {
    switch (type) {
      case GameType.TRUMP:
        return 'valtti';
      case GameType.NO_TRUMP:
        return 'grandi';
      case GameType.MISERE:
        return 'misääri';
      default:
        return '';
    }
  };

  const trumpSuitName = (trumpSuit: Suit): string => {
    switch (trumpSuit) {
      case Suit.DIAMOND:
        return 'ruutu';
      case Suit.CLUB:
        return 'risti';
      case Suit.HEART:
        return 'hertta';
      case Suit.SPADE:
        return 'pata';
      default:
        return '';
    }
  };

  return (
    <div className="statute">
      <h2>Käsi</h2>
      <div>Etuhenkilö: {statute.eldestHand.name}</div>
      <div>
        Pelimuoto:&nbsp;
        {statute.handType.isChoice && 'valinta/'}
        {statute.handType.gameType &&
          gameTypeName(statute.handType.gameType.value)}
      </div>
      {typeof statute.handType.gameType?.trumpSuit !== 'undefined' && (
        <div>
          Valttimaa: {trumpSuitName(statute.handType.gameType.trumpSuit)}
        </div>
      )}
    </div>
  );
};
