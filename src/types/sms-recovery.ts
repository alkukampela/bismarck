import { Player } from './player';

export interface SmsRecovery {
  gameId: string;
  player: Player;
  phone: string;
}
