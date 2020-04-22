import * as React from 'react';
import { TrickCard } from './TrickCard';
import { TrickCards as TrickCardsType } from '../../../../types/trick-cards';

export const Trick = () => {
  const fetchTrick = async function (): Promise<TrickCardsType> {
    const resp = await fetch(`http://localhost:3001/api/tricks`, {
      mode: 'cors',
    });
    return resp.ok ? ((await resp.json()) as TrickCardsType) : { cards: [] };
  };

  const [state, setState] = React.useState<TrickCardsType>({ cards: [] });
  React.useEffect(() => {
    setTimeout(() => {
      fetchTrick()
        .then((trick) => setState(trick))
        .catch();
    }, 3000);
  });

  return (
    <div className="trick">
      {state.cards.map((playerCard: any, index: number) => (
        <TrickCard trickCard={playerCard} key={index} />
      ))}
    </div>
  );
};
