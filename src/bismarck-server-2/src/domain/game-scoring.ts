import { GameScoreBoard } from '../../../types/game-score-board';
import { Player } from '../../../types/player';
import { PlayerScore } from '../../../types/player-score';
import { TrickScore } from '../../../types/trick-score';
import { DECK_SIZE, TABLE_CARDS } from '../types/cards-of-deck';
import { ErrorTypes } from '../types/error-types';
import { GameState } from '../types/game-state';
import { GameError } from '../utils/game-error';
import pino from 'pino';

const logger = pino();

const pointsSoFar = (
  previousTrickScore: TrickScore,
  player: Player
): number => {
  if (!previousTrickScore) {
    return 0;
  }

  const foundScore = previousTrickScore.scores.find(
    (currentScore) => currentScore.player.name === player.name
  );

  if (!foundScore) {
    // Not supposed to happen if players are consistent across tricks.
    logger.error(`Player ${player.name} not found in previous trick score`);
    throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
  }

  return foundScore.totalPoints;
};

const calculateScore = (
  trickPoints: PlayerScore[],
  previousTrickScore: TrickScore
): {
  player: Player;
  totalPoints: number;
}[] => {
  return trickPoints.map((playerScore) => {
    return {
      player: playerScore.player,
      totalPoints:
        pointsSoFar(previousTrickScore, playerScore.player) + playerScore.score,
    };
  });
};

const isFinished = (trickScores: TrickScore[]): boolean => {
  if (trickScores.length === 0) {
    // No tricks played yet, so hand is not finished.
    return false;
  }
  const players = trickScores[0].scores.length;
  const tricksPerHand = (DECK_SIZE - TABLE_CARDS) / players;
  return trickScores.length >= tricksPerHand;
};

export const calculateTrickPoints = (
  trickPoints: PlayerScore[],
  gameState: GameState
): TrickScore => {
  const allTrickPoints = gameState.trickScores;

  if (!gameState.handStatute.gameType) {
    // This should never happen if trick is ready.
    throw new GameError(ErrorTypes.UNEXPECTED_ERROR);
  }

  return {
    isChoice: gameState.handStatute.isChoice,
    gameType: gameState.handStatute.gameType.value,
    scores: calculateScore(trickPoints, allTrickPoints.slice(-1)[0]),
  };
};

export const getTotalScores = (gameState: GameState): GameScoreBoard => {
  return {
    trickScores: gameState.trickScores,
    isFinished: isFinished(gameState.trickScores),
  };
};
