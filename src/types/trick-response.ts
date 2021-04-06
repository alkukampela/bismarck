import { Player } from './player';
import { TrickCard } from './trick-card';

export interface TrickResponse {
  trickStatus: TrickStatus;
  cards: TrickCard[];
  trickNumber?: number;
  taker?: Player;
}

export enum TrickStatus {
  HAND_NOT_STARTED = 0,
  UNFINISHED = 3,
  FINISHED = 2,
}
