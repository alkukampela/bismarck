import * as React from 'react';
import { Card } from './Card';

export const PlayersHand = ({ player }: { player: String }) => {
  const [state, setState] = React.useState({ cards: [] });

  React.useEffect(() => {
    fetch(`http://localhost:3001/api/cards?player=${player}`, {
      mode: 'cors',
    })
      .then(response => {
        return response.json();
      })
      .then(cards => {
        setState(state => ({ ...state, cards }));
      })
      .catch(error => {
        console.log(error);
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
