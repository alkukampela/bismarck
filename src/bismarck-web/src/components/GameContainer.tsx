import { PlayersHand } from './PlayersHand';
import { TableCards } from './TableCards';
import { Trick } from './Trick';
import { Card } from '../../../types/card';
import { GameContext } from '../GameContext';
import * as React from 'react';

interface Cards {
  cards: Card[];
}

export const GameContainer = () => {
  const game = React.useContext(GameContext);

  const [tableCards, setTableCards] = React.useState<Card[]>([]);
  const [handCards, setHandCards] = React.useState<Card[]>([]);

  const fetchTableCards = async (): Promise<Card[]> => {
    const resp = await fetch(
      `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/tablecards`,
      {
        mode: 'cors',
      }
    );
    return (await resp.json()) as Card[];
  };

  const fetchHandCards = async (): Promise<Card[]> => {
    const resp = await fetch(
      `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/cards?player=${game.player}`,
      {
        mode: 'cors',
      }
    );
    return (await resp.json()) as Card[];
  };

  React.useEffect(() => {
    fetchTableCards().then((cards) => {
      setTableCards(cards);
    });
    fetchHandCards().then((cards) => {
      setHandCards(cards);
    });
  }, []);

  return (
    <div>
      <Trick />
      <PlayersHand cards={handCards} />
      <TableCards cards={tableCards} />
    </div>
  );
};
