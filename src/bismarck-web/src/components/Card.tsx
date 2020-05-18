import { Card as CardType } from '../../../types/card';
import { GameContext } from '../GameContext';
import * as React from 'react';

export const Card = ({ card, player }: { card: CardType; player?: string }) => {
  const game = React.useContext(GameContext);

  const [showCard, setState] = React.useState<boolean>(true);

  const getCardClass = (suit: string) => {
    return `card ${['♦️', '♥️'].includes(suit) ? 'red-card' : 'black-card'}`;
  };

  const removeCard = async (
    card: CardType,
    player: string
  ): Promise<boolean> => {
    const resp = await fetch(
      `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/cards?player=${player}&rank=${card.rank}&suit=${card.suit}`,
      {
        method: 'DELETE',
        mode: 'cors',
      }
    );
    return resp.ok;
  };

  const startTrick = async (
    card: CardType,
    player: string
  ): Promise<boolean> => {
    const resp = await fetch(
      `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/trick?player=${player}`,
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
  };

  const addToTrick = async (
    card: CardType,
    player: string
  ): Promise<boolean> => {
    const resp = await fetch(
      `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/trick/cards?player=${player}`,
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
  };

  const tryEverything = async () => {
    if (!player) {
      return;
    }

    const cardRemoved = await removeCard(card, player);
    if (cardRemoved) {
      setState(false);
      return;
    }

    const trickStarted = await startTrick(card, player);
    if (trickStarted) {
      setState(false);
      return;
    }

    const trickAdded = await addToTrick(card, player);
    if (trickAdded) {
      setState(false);
      return;
    }
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
