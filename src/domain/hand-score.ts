import { StorageService } from '../persistence/storage-service';
import { GameType } from '../types/game-type';
import { Player } from '../types/player';
import { PlayerScore } from '../types/player-score';

const storageService: StorageService = StorageService.getInstance();

const countScoreForEldestHand = (
  tricks: number,
  gameType: GameType,
  players: number
): number => {
  if (players === 4) {
    return gameType !== GameType.MISERE ? tricks - 6 : tricks * -1;
  }
  return gameType !== GameType.MISERE ? tricks - 8 : 2 - tricks;
};

const countScoreForNonEldestHand = (
  tricks: number,
  gameType: GameType,
  players: number
): number => {
  if (players === 4) {
    return gameType !== GameType.MISERE ? tricks - 2 : 4 - tricks;
  }
  return gameType !== GameType.MISERE ? tricks - 4 : 7 - tricks;
};

const countHandScore = (
  playerScore: PlayerScore,
  isEldestHand: boolean,
  players: number,
  gameType: GameType
): number => {
  return isEldestHand
    ? countScoreForEldestHand(playerScore.score, gameType, players)
    : countScoreForNonEldestHand(playerScore.score, gameType, players);
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

export const getHandsPoints = (
  trickTakers: PlayerScore[],
  gameType: GameType
): PlayerScore[] => {
  return trickTakers.map((playerScore) => {
    return {
      player: playerScore.player,
      score: countHandScore(
        playerScore,
        playerScore.player === trickTakers[0].player,
        trickTakers.length,
        gameType
      ),
    };
  });
};
