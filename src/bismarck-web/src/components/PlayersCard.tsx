import { Card } from './Card';
import { Card as CardType } from '../../../types/card';
import { TrickStatus } from '../../../types/trick-response';
import { GameContext } from '../GameContext';
import { addToTrick, removeCard, startTrick } from '../services/api-service';
import * as React from 'react';

export const PlayersCard = ({
  card,
  trickStatus,
  inRemovalStage,
  onPlay: onPlay,
}: {
  card: CardType;
  trickStatus: TrickStatus;
  inRemovalStage: boolean;
  onPlay: (card: CardType) => void;
}) => {
  const game = React.useContext(GameContext);

  const tryToRemove = async () => {
    if (await removeCard(game.token, game.gameId, card)) {
      onPlay(card);
    }
  };

  const tryToPlayCard = async () => {
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

  return (
    <div
      onClick={inRemovalStage ? tryToRemove : tryToPlayCard}
      className="players-card"
    >
      <Card card={card} />
    </div>
  );
};
