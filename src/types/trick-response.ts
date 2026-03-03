import { Player } from './player';
import { TrickCard } from './trick-card';

export type TrickStatus = 'HAND_NOT_STARTED' | 'UNFINISHED' | 'FINISHED';

export interface TrickResponse {
  trickStatus: TrickStatus;
  cards: TrickCard[];
  trickNumber?: number;
  taker?: Player;
}
