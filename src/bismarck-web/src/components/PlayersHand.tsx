import { Card } from './Card';
import { Card as CardType } from '../../../types/card';
import { GameContext } from '../GameContext';
import * as React from 'react';

interface Cards {
  cards: CardType[];
}

export const PlayersHand = ({ player }: { player: string }) => {
  const game = React.useContext(GameContext);

  const [handCards, setHandCards] = React.useState<Cards>({ cards: [] });

  React.useEffect(() => {
    const fetchCards = async (): Promise<CardType[]> => {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/cards?player=${player}`,
        {
          mode: 'cors',
        }
      );
      return (await resp.json()) as CardType[];
    };

    fetchCards().then((cards) => {
      setHandCards((state) => ({ ...state, cards }));
    });
  }, []);

  return (
    <div className="players-cards">
      {handCards.cards.map((card: CardType, index: number) => (
        <Card card={card} key={index} player={player} />
      ))}
    </div>
  );
};
