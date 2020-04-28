import { TrickCard } from './TrickCard';
import * as TC from '../../../types/trick-cards';
import * as React from 'react';

export const Trick = () => {
  const fetchTrick = async function (): Promise<TC.TrickCards> {
    const resp = await fetch(`http://localhost:3001/api/tricks`, {
      mode: 'cors',
    });
    return resp.ok ? ((await resp.json()) as TC.TrickCards) : { cards: [] };
  };

  const [cards, setCards] = React.useState<TC.TrickCards>({
    cards: [],
  });

  React.useEffect(() => {
    setTimeout(() => {
      fetchTrick()
        .then((trick) => setCards(trick))
        .catch();
    }, 1000);
  });

  return (
    <div>
      <div className="trick">
        {cards.cards.map((playerCard: TC.TrickCard, index: number) => (
          <TrickCard trickCard={playerCard} key={index} />
        ))}
      </div>
    </div>
  );
};
