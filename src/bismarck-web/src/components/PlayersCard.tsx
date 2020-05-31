import { Card } from './Card';
import { Card as CardType } from '../../../types/card';
import { GameContext } from '../GameContext';
import { addToTrick, removeCard, startTrick } from '../services/api-service';
import * as React from 'react';

export const PlayersCard = ({
  card,
  inRemovalStage,
  onCardRemoval,
}: {
  card: CardType;
  inRemovalStage: boolean;
  onCardRemoval: () => void;
}) => {
  const game = React.useContext(GameContext);

  const [showCard, setState] = React.useState<boolean>(true);

  const tryToRemove = async () => {
    const cardRemoved = await removeCard(game.token, game.gameId, card);
    if (cardRemoved) {
      setState(false);
      onCardRemoval();
      return;
    }
  };

  const tryToPlayCard = async () => {
    const trickStarted = await startTrick(game.token, game.gameId, card);
    if (trickStarted) {
      setState(false);
      return;
    }

    const trickAdded = await addToTrick(game.token, game.gameId, card);
    if (trickAdded) {
      setState(false);
      return;
    }
  };

  return (
    <div
      onClick={inRemovalStage ? tryToRemove : tryToPlayCard}
      style={{ display: showCard ? 'block' : 'none' }}
      className="players-card"
    >
      <Card card={card} />
    </div>
  );
};
