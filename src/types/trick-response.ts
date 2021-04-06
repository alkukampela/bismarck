import { Player } from './player';
import { TrickCard } from './trick-card';

export interface TrickResponse {
  trickStatus: TrickStatus;
  cards: TrickCard[];
  trickNumber?: number;
  taker?: Player;
}

export enum TrickStatus {
  HAND_NOT_STARTED = 1,
  UNFINISHED = 2,
  FINISHED = 3,
}
