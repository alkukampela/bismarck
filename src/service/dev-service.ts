import { ErrorTypes } from '../domain/error-types';
import {
  fetchCards,
  fetchGame,
  fetchGamesLogins,
  fetchHandStatute,
  fetchScores,
  fetchTrick,
  fetchTrickScores,
  storeCards,
  storeGame,
  storeHandStatute,
  storeLoginIdForPlayer,
  storeScores,
  storeTrick,
  storeTrickScores,
} from '../persistence/storage-service';
import { GameDump } from '../types/game-dump';

export const getGameDump = async (gameId: string): Promise<GameDump> => {
  if (process.env.NODE_ENV === 'production') {
    return Promise.reject(Error(ErrorTypes.FORBIDDEN));
  }

  const game = await fetchGame(gameId);
  const cards = await fetchCards(gameId);
  const playerScores = await fetchScores(gameId);
  const handStatute = await fetchHandStatute(gameId);
  const trick = await fetchTrick(gameId);
  const trickScores = await fetchTrickScores(gameId);
  const gameLogins = await fetchGamesLogins(gameId);

  return {
    game,
    cards,
    playerScores,
    handStatute,
    trick,
    trickScores,
    gameLogins: Array.from(gameLogins, ([loginId, gamePlayer]) => ({
      loginId,
      gamePlayer,
    })),
  };
};

export const importGameDump = async (
  gameId: string,
  gameDump: GameDump
): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    return Promise.reject(Error(ErrorTypes.FORBIDDEN));
  }

  if (!!gameDump.game) {
    storeGame(gameDump.game, gameId);
  }

  if (!!gameDump.cards) {
    storeCards(gameDump.cards, gameId);
  }

  if (!!gameDump.playerScores) {
    storeScores(gameDump.playerScores, gameId);
  }

  if (!!gameDump.handStatute) {
    storeHandStatute(gameDump.handStatute, gameId);
  }

  if (!!gameDump.trick) {
    storeTrick(gameDump.trick, gameId);
  }

  if (!!gameDump.trickScores) {
    storeTrickScores(gameDump.trickScores, gameId);
  }

  for (const gameLogin of gameDump.gameLogins) {
    storeLoginIdForPlayer(gameLogin.gamePlayer, gameLogin.loginId);
  }

  return Promise.resolve();
};
