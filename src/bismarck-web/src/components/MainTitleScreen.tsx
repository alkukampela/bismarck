import { Card } from './Card';
import { Card as CardType } from '../../../types/card';
import * as React from 'react';

export const MainTitleScreen = () => {
  const wordToCards = (word: string): CardType[] => {
    const suits: string[] = ['♦️', '♣️', '♥️', '♠️'];
    return [...word].map((letter, index) => {
      return { rank: letter.toUpperCase(), suit: suits[index % suits.length] };
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
