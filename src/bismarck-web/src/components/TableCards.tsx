import { Card } from './Card';
import { Card as CardType } from '../../../types/card';
import * as React from 'react';
import { TableCardsResponse } from '../../../types/table-cards-respons';

export const TableCards = ({
  apiResponse,
  show,
}: {
  apiResponse: TableCardsResponse;
  show: boolean;
}): React.ReactElement => {
  const shouldShow = show && apiResponse.areCardsOnTheTable;
  return (
    <div style={{ display: shouldShow ? 'block' : 'none' }}>
      <h2>Pöytäkortit</h2>
      <div className="table-cards">
        {apiResponse.cards.map((card: CardType, index: number) => (
          <Card card={card} key={index} />
        ))}
      </div>
    </div>
  );
};
