import { ErrorTypes } from '../domain/error-types';
import { PlayerSmsRecovery } from '../persistence/player-sms-recovery';
import {
  fetchSmsRecoveries,
  storeSmsRecoveries,
} from '../persistence/storage-service';
import { Player } from '../types/player';
import { SmsRecovery } from '../types/sms-recovery';

const playerMatches = (
  recovery: PlayerSmsRecovery,
  smsRecovery: SmsRecovery
): boolean => {
  return recovery.player.name === smsRecovery.player.name;
};

const updateRecoveryForPlayer = (
  playerSmsRecoveries: PlayerSmsRecovery[],
  player: Player
): PlayerSmsRecovery[] => {
  return playerSmsRecoveries.map((playerSmsRecovery) => {
    return playerSmsRecovery.player.name !== player.name
      ? playerSmsRecovery
      : {
          ...playerSmsRecovery,
          canSendRecovery: false,
        };
  });
};

export const sendRecoverySms = async (
  smsRecovery: SmsRecovery
): Promise<void> => {
  // TODO: validate phone number
  const gamesRecoveries = await fetchSmsRecoveries(smsRecovery.gameId);

  if (gamesRecoveries.length === 0) {
    return Promise.reject(new Error(ErrorTypes.GAME_NOT_FOUND));
  }

  if (
    !gamesRecoveries.some((recovery) => playerMatches(recovery, smsRecovery))
  ) {
    return Promise.reject(new Error(ErrorTypes.PLAYER_NOT_IN_GAME));
  }

  if (
    gamesRecoveries.some(
      (recovery) =>
        playerMatches(recovery, smsRecovery) && !recovery.canSendRecovery
    )
  ) {
    return Promise.reject(new Error(ErrorTypes.RECOVERY_SENT));
  }

  // TODO sent actual SMS
  console.log(
    `Sending sms to ${smsRecovery.phone} with loginId ${
      gamesRecoveries.filter((recovery) =>
        playerMatches(recovery, smsRecovery)
      )[0].loginId
    }`
  );

  storeSmsRecoveries(
    updateRecoveryForPlayer(gamesRecoveries, smsRecovery.player),
    smsRecovery.gameId
  );
};
