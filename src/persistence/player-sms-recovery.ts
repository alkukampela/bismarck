import { Player } from '../types/player';

export interface PlayerSmsRecovery {
  player: Player;
  canSendRecovery: boolean;
  loginId: string;
}
