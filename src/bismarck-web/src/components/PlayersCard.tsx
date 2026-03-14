import { Card } from './Card';
import { Card as CardType } from '../../../types/card';
import { TrickStatus } from '../../../types/trick-response';
import { GameContext } from '../GameContext';
import * as React from 'react';
import { ApiContext } from '../ApiContext';

export const PlayersCard = ({
  card,
  trickStatus,
  isInRemovalStage,
  isSelectedForRemoval,
  isMyTurn,
  onPlay: onPlay,
  onRemovalToggle: onRemovalToggle,
}: {
  card: CardType;
  trickStatus: TrickStatus;
  isInRemovalStage: boolean;
  isSelectedForRemoval: boolean;
  isMyTurn: boolean;
  onPlay: (card: CardType) => void;
  onRemovalToggle: (card: CardType) => void;
}) => {
  const game = React.useContext(GameContext);
  const api = React.useContext(ApiContext).api;

  const handleClick = async () => {
    if (isInRemovalStage) {
      onRemovalToggle(card);
      return;
    }

    if (!isMyTurn) {
      return;
    }

    if (trickStatus === 'UNFINISHED') {
      if (await api.addToTrick(game.token, game.gameId, card)) {
        onPlay(card);
      }
    } else {
      if (await api.startTrick(game.token, game.gameId, card)) {
        onPlay(card);
      }
    }
  };

  const getCardsClassNames = () => {
    return 'players-card'.concat(
      isSelectedForRemoval ? ' selected-for-removal' : ''
    );
  };

  return (
    <div onClick={handleClick} className={getCardsClassNames()}>
      <Card card={card} />
    </div>
  );
};
