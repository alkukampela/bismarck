import { Player } from './player';

export interface TokenResponse {
  gameId: string;
  player: Player;
  token: string;
}
