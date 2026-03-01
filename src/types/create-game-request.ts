import { Player } from './player';

export interface CreateGameRequest {
  players: {
    email: string;
    player: Player;
  }[];
}
