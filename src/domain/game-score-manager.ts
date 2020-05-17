import { StorageService } from '../persistence/storage-service';
import { GameScoreBoard } from '../types/game-score-board';
import { PlayerScore } from '../types/player-score';

const storageService = StorageService.getInstance();

const addToTotalScore = (totals: PlayerScore[], score: PlayerScore) => {
  totals.forEach((totalrow) => {
    if (totalrow.player.name === score.player.name) {
      totalrow.score += score.score;
    }
  });
};

const calculateScore = (allTrickPoints: PlayerScore[][]): PlayerScore[] => {
  const totals: PlayerScore[] = [];

  allTrickPoints.forEach((trickScore) => {
    trickScore.forEach((playerTrick) => {
      totals.filter(
        (playerTotal) => playerTotal.player.name === playerTrick.player.name
      ).length === 0
        ? totals.push(playerTrick)
        : addToTotalScore(totals, playerTrick);
    });
  });

  return totals;
};

export const saveTrickPoints = async (
  trickPoints: PlayerScore[],
  gameId: string
) => {
  const allTrickPoints = (await storageService.fetchTrickScores(gameId)) || [];
  allTrickPoints.push(trickPoints);

  storageService.storeTrickScores(allTrickPoints, gameId);
};

export const getTotalScores = async (
  gameId: string
): Promise<GameScoreBoard> => {
  const allTrickPoints = (await storageService.fetchTrickScores(gameId)) || [];
  return {
    trickScores: allTrickPoints,
    totalScore: calculateScore(allTrickPoints),
  };
};
