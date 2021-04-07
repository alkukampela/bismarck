import { Card } from './Card';
import { Card as CardType } from '../../../types/card';
import { GameContext } from '../GameContext';
import { addToTrick, removeCard, startTrick } from '../services/api-service';
import * as React from 'react';
import { TrickStatus } from '../../../types/trick-response';

export const PlayersCard = ({
  card,
  trickStatus,
  inRemovalStage,
  onCardRemoval,
}: {
  card: CardType;
  trickStatus: TrickStatus;
  inRemovalStage: boolean;
  onCardRemoval: () => void;
}) => {
  const game = React.useContext(GameContext);

  const [cardIsVisible, setCardVisibility] = React.useState<boolean>(true);

  const tryToRemove = async () => {
    const cardRemoved = await removeCard(game.token, game.gameId, card);
    if (cardRemoved) {
      setCardVisibility(false);
      onCardRemoval();
    }
  };

  const tryToPlayCard = async () => {
    if (trickStatus !== TrickStatus.UNFINISHED) {
      const trickStarted = await startTrick(game.token, game.gameId, card);
      if (trickStarted) {
        setCardVisibility(false);
        return;
      }
    }

    if (trickStatus === TrickStatus.UNFINISHED) {
      const trickAdded = await addToTrick(game.token, game.gameId, card);
      if (trickAdded) {
        setCardVisibility(false);
      }
    }
  };

  return (
    <div
      onClick={inRemovalStage ? tryToRemove : tryToPlayCard}
      style={{ display: cardIsVisible ? 'block' : 'none' }}
      className="players-card"
    >
      <Card card={card} />
    </div>
  );
};
