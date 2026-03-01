import { ErrorTypes } from '../types/error-types';
import {
  fetchCards,
  fetchGameState,
  fetchScores,
  fetchTrick,
  storeCards,
  storeGameState,
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

  return {
    gameState,
    cards,
    playerScores,
    trick,
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

  return Promise.resolve();
};
