import { GameTypeChoice } from '../../../types/game-type-choice';
import { GameContext } from '../GameContext';
import { postChoice } from '../services/api-service';
import * as React from 'react';

export const ChoiceButton = ({
  text,
  gameTypeChoice,
}: {
  text: string;
  gameTypeChoice: GameTypeChoice;
}) => {
  const game = React.useContext(GameContext);

  const chooseGameType = () => {
    postChoice(game.token, game.gameId, gameTypeChoice).finally(
      () => location.reload() // Ugly haxxx
    );
  };

  return (
    <button type="button" onClick={chooseGameType}>
      {text}
    </button>
  );
};
