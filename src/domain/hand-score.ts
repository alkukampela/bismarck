import { GameType } from '../types/game-type';
import { Player } from '../types/player';
import { PlayerScore } from '../types/player-score';

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

export const updatedTrickScore = (
  trickTaker: Player,
  playerScores: PlayerScore[]
): PlayerScore[] => {
  return playerScores.map((playerScore) => {
    return playerScore.player.name === trickTaker.name
      ? { ...playerScore, score: playerScore.score + 1 }
      : playerScore;
  });
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
