import * as React from 'react';

import { Card as CardType } from '../../../types/card';

export const Card = ({ card, player }: { card: CardType; player?: string }) => {
  const [showCard, setState] = React.useState<boolean>(true);

  const getCardClass = (suit: string) => {
    return `card ${['♦️', '♥️'].includes(suit) ? 'red-card' : 'black-card'}`;
  };

  async function removeCard(card: CardType, player: string): Promise<boolean> {
    const resp = await fetch(
      `http://localhost:3001/api/cards?player=${player}&rank=${card.rank}&suit=${card.suit}`,
      {
        method: 'DELETE',
        mode: 'cors',
      }
    );
    return resp.ok;
  }

  async function startTrick(card: CardType, player: string): Promise<boolean> {
    const resp = await fetch(
      `http://localhost:3001/api/tricks?player=${player}`,
      {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(card),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return resp.ok;
  }

  async function addToTrick(card: CardType, player: string): Promise<boolean> {
    const resp = await fetch(
      `http://localhost:3001/api/tricks/cards?player=${player}`,
      {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(card),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return resp.ok;
  }

  const tryEverything = () => {
    if (!player) {
      return;
    }

    removeCard(card, player).then((success) => success && setState(false));
    startTrick(card, player).then((success) => success && setState(false));
    addToTrick(card, player).then((success) => success && setState(false));
  };

  return (
    <div
      className={getCardClass(card.suit)}
      onClick={tryEverything}
      style={{ display: showCard ? 'block' : 'none' }}
    >
      <div className="suit">{card.suit}</div>
      <div className="rank">{card.rank}</div>
    </div>
  );
};
