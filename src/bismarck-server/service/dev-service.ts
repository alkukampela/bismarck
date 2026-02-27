import { ErrorTypes } from '../types/error-types';
import {
  fetchCards,
  fetchGameState,
  fetchGamesLogins,
  fetchScores,
  fetchTrick,
  storeCards,
  storeGameState,
  storeLoginIdForPlayer,
  storeScores,
  storeTrick,
} from '../persistence/storage-service';
import { GameDump } from '../types/game-dump';

export const getGameDump = async (gameId: string): Promise<GameDump> => {
  if (process.env.NODE_ENV === 'production') {
    return Promise.reject(Error(ErrorTypes.FORBIDDEN));
  }

  const gameState = await fetchGameState(gameId);
  const cards = await fetchCards(gameId);
  const playerScores = await fetchScores(gameId);
  const trick = await fetchTrick(gameId);
  const gameLogins = await fetchGamesLogins(gameId);

  return {
    gameState,
    cards,
    playerScores,
    trick,
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

  if (gameDump.gameState) {
    storeGameState(gameDump.gameState, gameId);
  }

  if (gameDump.cards) {
    storeCards(gameDump.cards, gameId);
  }

  if (gameDump.playerScores) {
    storeScores(gameDump.playerScores, gameId);
  }

  if (gameDump.trick) {
    storeTrick(gameDump.trick, gameId);
  }

  for (const gameLogin of gameDump.gameLogins) {
    storeLoginIdForPlayer(gameLogin.gamePlayer, gameLogin.loginId);
  }

  return Promise.resolve();
};
