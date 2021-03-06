import { PlayerCumulativeScore } from './player-cumulative-score';
import { TrickScore } from '../../../types/trick-score';
import { PlayerScore } from '../../../types/player-score';
import { Player } from '../../../types/player';

export const trickScoresToCumulativeScores = (
  trickScores: TrickScore[]
): PlayerCumulativeScore[] => {
  interface PlayerPoints {
    name: string;
    totalPoints: number;
  }

  const allTricksPoints: PlayerPoints[] = Array.prototype.concat.apply(
    [],
    trickScores.map((trickScore) => {
      return trickScore.scores.map((playerPoints) => {
        return {
          name: playerPoints.player.name,
          totalPoints: playerPoints.totalPoints,
        } as PlayerPoints;
      });
    })
  );

  return allTricksPoints.reduce(
    (
      accumulator: PlayerCumulativeScore[],
      currentValue: PlayerPoints
    ): PlayerCumulativeScore[] => {
      const playersPoints = accumulator.find(
        (score: { name: string }) => score.name === currentValue.name
      );

      if (!!playersPoints) {
        playersPoints.points.push(currentValue.totalPoints);
      } else {
        {
          accumulator.push({
            name: currentValue.name,
            points: [currentValue.totalPoints],
          });
        }
      }

      return accumulator;
    },
    []
  );
};

const playersPosition = (
  playerScore: number,
  trickScore: TrickScore
): number => {
  return (
    trickScore.scores.filter((x) => x.totalPoints > playerScore).length + 1
  );
};

const convertToRoman = (position: number): string => {
  return position < 4 ? 'I'.repeat(position) : 'IV';
};

export const calculateFinalResults = (
  trickScores: TrickScore[]
): {
  player: string;
  points: number;
  position: string;
}[] => {
  if (trickScores.length === 0) {
    return [];
  }

  const lastTrick = trickScores.slice(-1)[0];

  return lastTrick.scores
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((score) => {
      return {
        player: score.player.name,
        points: score.totalPoints,
        position: convertToRoman(playersPosition(score.totalPoints, lastTrick)),
      };
    });
};

const previousHandsScoreForPlayer = (
  trickScores: TrickScore[],
  player: Player
): number => {
  return (
    trickScores[trickScores.length - 2]?.scores.find(
      (trickScore) => trickScore.player.name === player.name
    )?.totalPoints || 0
  );
};

export const calculatePointsForFinishedHand = (
  trickScores: TrickScore[]
): PlayerScore[] => {
  return trickScores[trickScores.length - 1].scores.map((trickScore) => {
    return {
      player: trickScore.player,
      score:
        trickScore.totalPoints -
        previousHandsScoreForPlayer(trickScores, trickScore.player),
    };
  });
};
