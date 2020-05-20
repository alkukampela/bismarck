import { Card } from './card';
import { Player } from './player';

export interface TrickCard {
  player: Player;
  card?: Card;
}
