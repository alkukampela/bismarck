import { GameTypeChoiceRequest } from '../../../types/game-type-choice-request';
import { ApiContext } from '../ApiContext';
import { GameContext } from '../GameContext';
import * as React from 'react';

export const ChoiceButton = ({
  text,
  gameTypeChoice,
}: {
  text: string;
  gameTypeChoice: GameTypeChoiceRequest;
}): React.ReactElement => {
  const game = React.useContext(GameContext);
  const api = React.useContext(ApiContext).api;

  const chooseGameType = () => {
    api.postChoice(game.token, game.gameId, gameTypeChoice);
  };

  return (
    <button type="button" onClick={chooseGameType}>
      {text}
    </button>
  );
};
