import { StorageService } from '../persistence/storage-service';
import { GameScoreBoard } from '../types/game-score-board';
import { PlayerScore } from '../types/player-score';
import { HandStatute } from '../types/hand-statute';
import { TrickScore } from '../types/trick-score';
import { Player } from '../types/player';

const storageService = StorageService.getInstance();

const pointsSoFar = (
  previousTrickScore: TrickScore,
  player: Player
): number => {
  return (
    (!!previousTrickScore &&
      previousTrickScore.scores.find(
        (currentScore) => currentScore.player.name === player.name
      ).totalPoints) ||
    0
  );
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
) => {
  const allTrickPoints = (await storageService.fetchTrickScores(gameId)) || [];

  const trickScore = {
    isChoice: handStatute.handType.isChoice,
    gameType: handStatute.handType.gameType.value,
    scores: calculateScore(trickPoints, allTrickPoints.slice(-1)[0]),
  };

  allTrickPoints.push(trickScore);

  storageService.storeTrickScores(allTrickPoints, gameId);
};

export const getTotalScores = async (
  gameId: string
): Promise<GameScoreBoard> => {
  const trickScores = (await storageService.fetchTrickScores(gameId)) || [];
  return {
    trickScores,
    isFinished: isFinished(trickScores),
  };
};
