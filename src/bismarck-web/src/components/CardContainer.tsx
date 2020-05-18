import { PlayersHand } from './PlayersHand';
import { TableCards } from './TableCards';
import { Trick } from './Trick';
import { Card } from '../../../types/card';
import { GameContext } from '../GameContext';
import * as React from 'react';

export const Foo = () => {
  const game = React.useContext(GameContext);

  const [tableCards, setTableCards] = React.useState<Card[]>([]);

  React.useEffect(() => {
    const fetchCards = async (): Promise<Card[]> => {
      const resp = await fetch(
        `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/tablecards`,
        {
          mode: 'cors',
        }
      );
      return (await resp.json()) as Card[];
    };

    fetchCards().then((fetchedCards) => {
      setTableCards(fetchedCards);
    });
  }, []);

  return (
    <div>
      <Trick />
      <PlayersHand />
      <TableCards cards={tableCards} />
    </div>
  );
};
