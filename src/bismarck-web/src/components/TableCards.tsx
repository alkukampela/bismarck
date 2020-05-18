import { Card } from './Card';
import { Card as CardType } from '../../../types/card';
import * as React from 'react';

export const TableCards = ({ cards: cards }: { cards: CardType[] }) => {
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
