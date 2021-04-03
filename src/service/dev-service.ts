import { ErrorTypes } from '../domain/error-types';
import {
  fetchCards,
  fetchGame,
  fetchGamesLogins,
  fetchHandStatute,
  fetchScores,
  fetchTrick,
  fetchTrickScores,
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
