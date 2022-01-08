import { Card } from './Card';
import { Card as CardType } from '../../../types/card';
import { TrickStatus } from '../../../types/trick-response';
import { GameContext } from '../GameContext';
import { addToTrick, startTrick } from '../services/api-service';
import * as React from 'react';

export const PlayersCard = ({
  card,
  trickStatus,
  isInRemovalStage,
  isSelectedForRemoval,
  onPlay: onPlay,
  onRemovalToggle: onRemovalToggle,
}: {
  card: CardType;
  trickStatus: TrickStatus;
  isInRemovalStage: boolean;
  isSelectedForRemoval: boolean;
  onPlay: (card: CardType) => void;
  onRemovalToggle: (card: CardType) => void;
}) => {
  const game = React.useContext(GameContext);

  const handleClick = async () => {
    if (isInRemovalStage) {
      onRemovalToggle(card);
      return;
    }

    if (trickStatus === TrickStatus.UNFINISHED) {
      if (await addToTrick(game.token, game.gameId, card)) {
        onPlay(card);
      }
    } else {
      if (await startTrick(game.token, game.gameId, card)) {
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
