import { Card } from './card';

export interface TrickCard {
  player: string;
  card?: Card;
}

export interface TrickCards {
  cards: TrickCard[];
}
