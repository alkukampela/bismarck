import { getHandStatute } from './hand-statute-machine';
import { sendGameLink } from '../service/email-service';
import { CreateGameResponse } from '../types/create-game-response';
import { Game } from '../types/game';
import { RegisterPlayer } from '../types/register-player';
import shuffle from 'fisher-yates';
import { v4 as uuid } from 'uuid';
import {
  storeGame,
  storeHandStatute,
  storeLoginIdForPlayer,
  storeSmsRecoveries,
} from '../persistence/storage-service';

const initGameObject = (players: RegisterPlayer[]): Game => {
  return {
    players: shuffle(players.map((item) => item.player)),
    handNumber: 0,
  };
};

const checkForDuplicatePlayers = (players: RegisterPlayer[]): boolean => {
  return (
    new Set(
      players.map((item) => {
        return item.player.name;
      })
    ).size !== players.length
  );
};

const generateIdentifier = (): string => {
  return uuid().replace('-', '').substring(0, 11);
};

const createMapWithPlayerIds = (
  players: RegisterPlayer[]
): Map<string, RegisterPlayer> => {
  const playerIds = new Map<string, RegisterPlayer>();

  players.forEach((item) => {
    playerIds.set(generateIdentifier(), item);
  });

  return playerIds;
};

export const createGameAndInvitatePlayers = async (
  players: RegisterPlayer[]
): Promise<CreateGameResponse> => {
  if (players.length < 3 || players.length > 4) {
    return Promise.reject(new Error('Must have 3 or 4 players'));
  }

  if (checkForDuplicatePlayers(players)) {
    return Promise.reject(new Error('Players must have unique names'));
  }

  // TODO validate emails

  const gameId = generateIdentifier();
  const playerIds = createMapWithPlayerIds(players);

  playerIds.forEach((value, loginId) => {
    storeLoginIdForPlayer({ gameId, player: value.player }, loginId);
    sendGameLink(value, loginId);
  });

  const game = initGameObject(players);

  storeGame(game, gameId);

  const handStatute = getHandStatute(game, null);

  storeHandStatute(handStatute, gameId);

  storeSmsRecoveries(
    [...playerIds.entries()].map((x) => {
      return {
        player: x[1].player,
        canSendRecovery: true,
        loginId: x[0],
      };
    }),
    gameId
  );

  return {
    id: gameId,
    game,
  };
};
