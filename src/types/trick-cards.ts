import { Player } from './player';
import { TrickCard } from './trick-card';

export interface TrickCards {
  cards: TrickCard[];
  taker?: Player;
}
