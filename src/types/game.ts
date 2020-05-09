import { Player } from './player';

export interface Game {
  players: Player[];
  handNumber: number;
}
