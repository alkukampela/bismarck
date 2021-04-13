import { GameScoreBoard } from '../../../types/game-score-board';
import { PlayerScore } from '../../../types/player-score';
import { TrickScore } from '../../../types/trick-score';
import { calculatePointsForFinishedHand } from '../domain/score-calculators';
import { GameContext } from '../GameContext';
import { initHand } from '../services/api-service';
import * as React from 'react';

export const HandScores = ({
  scores,
  isHandReady,
}: {
  scores: GameScoreBoard;
  isHandReady: boolean;
}) => {
  const game = React.useContext(GameContext);

  const moveToNextHand = () => {
    initHand(game.token, game.gameId).finally(() => location.reload());
  };

  const handScores = (trickScores: TrickScore[]): PlayerScore[] => {
    if (!trickScores.length) {
      return [];
    }
    return calculatePointsForFinishedHand(trickScores);
  };

  const isVisible = (): boolean =>
    isHandReady && !!scores.trickScores.length && !scores.isFinished;

  const showButton = (): boolean => {
    return !!game.player || !!game.token;
  };

  return (
    <div
      style={{
        display: isVisible() ? 'block' : 'none',
      }}
      className="final-scores-container"
    >
      <h1>Jaon tulokset</h1>
      {handScores(scores.trickScores).map(
        (playerScore: PlayerScore, index: number) => (
          <div key={index}>
            {playerScore.player.name}: {playerScore.score}
          </div>
        )
      )}
      <button
        type="button"
        onClick={moveToNextHand}
        style={{ display: showButton() ? 'block' : 'none', marginTop: '1rem' }}
      >
        Seuraava jako
      </button>
    </div>
  );
};
