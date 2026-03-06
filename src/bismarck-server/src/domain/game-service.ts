import { ErrorTypes } from '../types/error-types';
import { setUpHand } from './hand-service';
import { HandStatuteResponse } from '../../../types/hand-statute-response';
import { GameStorage } from '../persistence/game-storage';
import { noCardsLeft } from './deck-operations';
import { GameError } from '../utils/game-error';
import { GameType } from '../../../types/game-type';
import { toHandStatute } from './hand-statute-machine';

export const initHand = async (
  stub: DurableObjectStub<GameStorage>
): Promise<HandStatuteResponse> => {
  const deck = await stub.fetchDeck();
  const isHandFinished = noCardsLeft(deck);

  if (!isHandFinished) {
    return Promise.reject(new GameError(ErrorTypes.CURRENT_HAND_NOT_FINISHED));
  }

  const gameState = await stub.fetchGameState();

  if (!gameState) {
    return Promise.reject(new GameError(ErrorTypes.GAME_NOT_FOUND));
  }

  if (gameState.handNumber >= gameState.players.length * 4) {
    return Promise.reject(new GameError(ErrorTypes.GAME_ENDED));
  }

  const statute = setUpHand(gameState, stub);

  stub.storeTrickPoints(
    statute.playerOrder.map((player) => {
      return { player, score: 0 };
    })
  );

  const updatedGameState = {
    ...gameState,
    handNumber: gameState.handNumber + 1,
    handStatute: statute,
  };

  stub.storeGameState(updatedGameState);
  stub.clearTrick();

  return toHandStatute(statute);
};
