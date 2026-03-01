import { fetchGameState } from '../persistence/storage-service';
import { GameScoreBoard } from '../../../types/game-score-board';
import { Player } from '../../../types/player';
import { PlayerScore } from '../../../types/player-score';
import { TrickScore } from '../../../types/trick-score';
import { GameState } from '../types/game-state';

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
    throw new Error(`Player ${player.name} not found in previous trick score`);
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
    return false;
  }
  const players = trickScores[0].scores.length;
  const rounds = 4;
  return trickScores.length >= players * rounds;
};

export const calculateTrickPoints = (
  trickPoints: PlayerScore[],
  gameState: GameState
): TrickScore => {
  const allTrickPoints = gameState.trickScores;

  if (!gameState.handStatute.gameType) {
    // This should never happen if trick is ready.
    throw new Error('Game type is not defined');
  }

  return {
    isChoice: gameState.handStatute.isChoice,
    gameType: gameState.handStatute.gameType.value,
    scores: calculateScore(trickPoints, allTrickPoints.slice(-1)[0]),
  };
};

export const getTotalScores = async (
  gameId: string
): Promise<GameScoreBoard> => {
  const gameState = await fetchGameState(gameId);
  return {
    trickScores: gameState.trickScores,
    isFinished: isFinished(gameState.trickScores),
  };
};
