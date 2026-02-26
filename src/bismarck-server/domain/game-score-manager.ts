import {
  fetchTrickScores,
  storeTrickScores,
} from '../persistence/storage-service';
import { GameScoreBoard } from '../../types/game-score-board';
import { HandStatute } from '../../types/hand-statute';
import { Player } from '../../types/player';
import { PlayerScore } from '../../types/player-score';
import { TrickScore } from '../../types/trick-score';

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

export const saveTrickPoints = async (
  trickPoints: PlayerScore[],
  handStatute: HandStatute,
  gameId: string
): Promise<void> => {
  const allTrickPoints = (await fetchTrickScores(gameId)) || [];

  if (!handStatute.gameType) {
    // This should never happen if trick is ready.
    throw new Error('Game type is not defined');
  }

  const trickScore = {
    isChoice: handStatute.isChoice,
    gameType: handStatute.gameType.value,
    scores: calculateScore(trickPoints, allTrickPoints.slice(-1)[0]),
  };

  allTrickPoints.push(trickScore);

  storeTrickScores(allTrickPoints, gameId);
};

export const getTotalScores = async (
  gameId: string
): Promise<GameScoreBoard> => {
  const trickScores = (await fetchTrickScores(gameId)) || [];
  return {
    trickScores,
    isFinished: isFinished(trickScores),
  };
};
