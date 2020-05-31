import { GameContext } from '../GameContext';
import { GameTypeChoice } from '../../../types/game-type-choice';
import * as React from 'react';
import { postChoice } from '../services/api-service';

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
