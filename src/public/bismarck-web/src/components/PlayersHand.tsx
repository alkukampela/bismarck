import * as React from 'react';
import { Card } from './Card';
import { Card as CardType } from '../../../../types/card';

interface Cards {
  cards: CardType[];
}

export const PlayersHand = ({ player }: { player: String }) => {
  const [state, setState] = React.useState<Cards>({ cards: [] });

  React.useEffect(() => {
    const fetchCards = async function(): Promise<CardType[]> {
      const resp = await fetch(
        `http://localhost:3001/api/cards?player=${player}`,
        {
          mode: 'cors',
        }
      );
      const result = await resp.json();
      return result as CardType[];
    };

    fetchCards().then(cards => {
      setState(state => ({ ...state, cards }));
    });
  }, []);
  return (
    <div className="playersCards">
      {state.cards.map((card: any, index: number) => (
        <Card card={card} key={index} />
      ))}
    </div>
  );
};
