import { GameScoreBoard } from '../../../types/game-score-board';
import { PlayerScore } from '../../../types/player-score';
import { TrickScore } from '../../../types/trick-score';
import { ApiContext } from '../ApiContext';
import { calculatePointsForFinishedHand } from '../domain/score-calculators';
import { GameContext } from '../GameContext';
import * as React from 'react';

export const HandScores = ({
  scores,
  isHandReady,
}: {
  scores: GameScoreBoard;
  isHandReady: boolean;
}): React.ReactElement => {
  const game = React.useContext(GameContext);
  const api = React.useContext(ApiContext).api;

  const moveToNextHand = () => {
    api.initHand(game.token, game.gameId).finally(() => location.reload());
  };

  const handScores = (trickScores: TrickScore[]): PlayerScore[] => {
    if (!trickScores.length) {
      return [];
    }
    return calculatePointsForFinishedHand(trickScores);
  };

  const isVisible = (): boolean =>
    isHandReady && !!scores.trickScores.length && !scores.isFinished;

  const showButton = (): boolean => !!game.player || !!game.token;

  return (
    <div>
      <div
        className="hand-scores-overlay"
        style={{ display: isVisible() ? 'block' : 'none' }}
      ></div>
      <div
        className="hand-scores-container"
        style={{ display: isVisible() ? 'block' : 'none' }}
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
          style={{
            display: showButton() ? 'block' : 'none',
            marginTop: '1rem',
          }}
        >
          Seuraava jako
        </button>
      </div>
    </div>
  );
};
