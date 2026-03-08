import { Card } from './Card';
import { Card as CardType, Rank, Suit } from '../../../types/card';
import * as React from 'react';

export const GameTitle = (): React.ReactElement => {
  const wordToCards = (word: string): CardType[] => {
    const suits: Suit[] = ['♥️', '♣️', '♦️', '♠️'];
    return [...word].map((letter, index) => {
      return {
        // Faking type is fine here becacuse it will
        // used purely for display purposes.
        rank: letter.toUpperCase() as Rank,
        suit: suits[index % suits.length],
      };
    });
  };

  const cardsFromLetters = wordToCards('Bismarck');

  return (
    <div className="main-title-cards">
      {cardsFromLetters.map((card: CardType, index: number) => (
        <div className="main-title-card" key={index}>
          <Card card={card} />
        </div>
      ))}
    </div>
  );
};
