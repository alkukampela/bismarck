import { StorageService } from '../persistence/storage-service';
import { GameType } from '../types/game-type';
import { Player } from '../types/player';
import { PlayerScore } from '../types/player-score';

const storageService: StorageService = StorageService.getInstance();

const isEldestHand = (player: Player, scores: PlayerScore[]): boolean => {
  return player === scores[0].player;
};

const countScoreForEldestHand = (
  tricks: number,
  gameType: GameType
): number => {
  return gameType !== GameType.MISERE ? tricks - 6 : tricks * -1;
};

const countScoreForNonEldestHand = (
  tricks: number,
  gameType: GameType
): number => {
  return gameType !== GameType.MISERE ? tricks - 2 : 4 - tricks;
};

const countHandScore = (
  playerScore: PlayerScore,
  scores: PlayerScore[],
  gameType: GameType
): number => {
  return isEldestHand(playerScore.player, scores)
    ? countScoreForEldestHand(playerScore.score, gameType)
    : countScoreForNonEldestHand(playerScore.score, gameType);
};

export const setUpHandScore = (players: Player[], gameId: string): void => {
  storageService.storeScores(
    players.map((player) => {
      return { player, score: 0 } as PlayerScore;
    }),
    gameId
  );
};

export const updateTrickTakerToHandScore = (
  player: Player,
  gameId: string
): void => {
  storageService.fetchScores(gameId).then((scores) => {
    scores
      .filter((score) => player.name === score.player.name)
      .forEach((x) => x.score++);
    storageService.storeScores(scores, gameId);
  });
};

export const getHandScoresTricks = async (
  gameId: string
): Promise<PlayerScore[]> => {
  return storageService.fetchScores(gameId);
};

export const getHandsPoints = async (
  gameType: GameType,
  gameId: string
): Promise<PlayerScore[]> => {
  return storageService.fetchScores(gameId).then((scores) =>
    scores.map((playerScore) => {
      return {
        player: playerScore.player,
        score: countHandScore(playerScore, scores, gameType),
      };
    })
  );
};
