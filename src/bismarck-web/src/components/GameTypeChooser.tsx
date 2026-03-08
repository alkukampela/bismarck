import { ChoiceButton } from './ChoiceButton';
import { GameType } from '../../../types/game-type';
import { SuitEnum } from '../../../types/suit';
import * as React from 'react';
import { HandStatuteResponse } from '../../../types/hand-statute-response';

export const GameTypeChooser = ({
  handStatute,
  player,
}: {
  handStatute: HandStatuteResponse;
  player: string;
}) => {
  const shouldShowGameChooseType = (): boolean => {
    return (
      player === handStatute.eldestHand.name &&
      handStatute.isChoice &&
      !handStatute.gameType
    );
  };

  return (
    <div
      style={{
        display: shouldShowGameChooseType() ? 'block' : 'none',
      }}
    >
      <div className="info-container">
        <h2>Valitse pelityyppi</h2>
      </div>
      <div className="choice-buttons">
        <ChoiceButton
          text="Ruutuvaltti"
          gameTypeChoice={{
            gameType: GameType.TRUMP,
            trumpSuit: SuitEnum.DIAMOND,
          }}
        />
        <ChoiceButton
          text="Ristivaltti"
          gameTypeChoice={{
            gameType: GameType.TRUMP,
            trumpSuit: SuitEnum.CLUB,
          }}
        />
        <ChoiceButton
          text="Herttavaltti"
          gameTypeChoice={{
            gameType: GameType.TRUMP,
            trumpSuit: SuitEnum.HEART,
          }}
        />
        <ChoiceButton
          text="Patavaltti"
          gameTypeChoice={{
            gameType: GameType.TRUMP,
            trumpSuit: SuitEnum.SPADE,
          }}
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
