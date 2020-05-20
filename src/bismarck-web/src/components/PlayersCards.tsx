import { PlayersCard } from './PlayersCard';
import { Card as CardType } from '../../../types/card';
import { GameContext } from '../GameContext';
import * as React from 'react';

export const PlayersCards = ({ cards }: { cards: CardType[] }) => {
  const game = React.useContext(GameContext);

  return (
    <div className="players-cards">
      {cards.map((card: CardType, index: number) => (
        <PlayersCard card={card} key={index} player={game.player} />
      ))}
    </div>
  );
};
