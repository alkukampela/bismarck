import { ReadOnlyCard } from './ReadOnlyCard';
import { Card as CardType } from '../../../types/card';
import * as React from 'react';

export const TableCards = ({
  cards,
  show,
}: {
  cards: CardType[];
  show: boolean;
}) => {
  return (
    <div style={{ display: show ? 'block' : 'none' }}>
      <h2>Pöytäkortit</h2>
      <div className="table-cards">
        {cards.map((card: CardType, index: number) => (
          <ReadOnlyCard card={card} key={index} />
        ))}
      </div>
    </div>
  );
};
