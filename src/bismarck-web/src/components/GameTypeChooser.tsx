import { ChoiceButton } from './ChoiceButton';
import { GameType } from '../../../types/game-type';
import { Suit } from '../../../types/suit';
import * as React from 'react';

export const GameTypeChooser = () => {
  return (
    <div>
      <div className="info-container">
        <h2>Valitse pelityyppi</h2>
      </div>
      <div className="choice-buttons">
        <ChoiceButton
          text="Ruutuvaltti"
          gameTypeChoice={{ gameType: GameType.TRUMP, trumpSuit: Suit.DIAMOND }}
        />
        <ChoiceButton
          text="Ristivaltti"
          gameTypeChoice={{ gameType: GameType.TRUMP, trumpSuit: Suit.CLUB }}
        />
        <ChoiceButton
          text="Herttavaltti"
          gameTypeChoice={{ gameType: GameType.TRUMP, trumpSuit: Suit.HEART }}
        />
        <ChoiceButton
          text="Patavaltti"
          gameTypeChoice={{ gameType: GameType.TRUMP, trumpSuit: Suit.SPADE }}
        />
        <ChoiceButton
          text="Grandi"
          gameTypeChoice={{ gameType: GameType.NO_TRUMP }}
        />
        <ChoiceButton
          text="Misääri"
          gameTypeChoice={{ gameType: GameType.MISERE }}
        />
      </div>
    </div>
  );
};
