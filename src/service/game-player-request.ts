import { Player } from '../types/player';
import { GameRequest } from './game-request';

export interface GamePlayerRequest extends GameRequest {
  player: Player;
}
