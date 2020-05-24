import { GameContext } from '../GameContext';
import { GameTypeChoice } from '../../../types/game-type-choice';
import * as React from 'react';
import { fumps as postChoice } from '../services/api-service';

export const ChoiceButton = ({
  text,
  gameTypeChoice,
}: {
  text: string;
  gameTypeChoice: GameTypeChoice;
}) => {
  const game = React.useContext(GameContext);

  const chooseGameType = () => {
    postChoice(game.player, game.gameId, gameTypeChoice);
  };

  return (
    <button type="button" onClick={chooseGameType}>
      {text}
    </button>
  );
};
