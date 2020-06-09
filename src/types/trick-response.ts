import { Player } from './player';
import { TrickCard } from './trick-card';

export interface TrickResponse {
  cards: TrickCard[];
  trickNumber?: number;
  taker?: Player;
}
