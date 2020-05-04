import { Card } from './Card';
import { Card as CardType } from '../../../types/card';
import { GameContext } from '../GameContext';
import * as React from 'react';

export const TableCards = () => {
  const game = React.useContext(GameContext);

  const [cards, setCards] = React.useState<CardType[]>([]);

  React.useEffect(() => {
    const fetchCards = async (): Promise<CardType[]> => {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/tablecards`,
        {
          mode: 'cors',
        }
      );
      return (await resp.json()) as CardType[];
    };

    fetchCards().then((fetchedCards) => {
      setCards(fetchedCards);
    });
  }, []);

  return (
    <div>
      <h2>Pöytäkortit</h2>
      <div className="table-cards">
        {cards.map((card: CardType, index: number) => (
          <Card card={card} key={index} />
        ))}
      </div>
    </div>
  );
};
