import { calculateFinalResults } from '../domain/score-calculators';
import { GameScoreBoard } from '../../../types/game-score-board';
import { emptyScores } from '../domain/default-objects';
import { extractGameId } from '../services/game-id-extractor';
import { ScoreSheet } from './ScoreSheet';
import * as React from 'react';
import { ApiContext } from '../ApiContext';

export const Results = () => {
  const [scores, setScores] = React.useState<GameScoreBoard>(emptyScores);
  const api = React.useContext(ApiContext).api;

  React.useEffect(() => {
    const gameId = extractGameId(document);

    api.fetchScores(gameId, emptyScores).then((fetchedScores) => {
      setScores(fetchedScores);
    });
  }, [api]);

  return (
    <div className="results-container">
      <h1>{scores.isFinished ? 'Lopputulokset' : 'Tilanne'}</h1>

      {scores.isFinished && (
        <ul className="final-player-positions">
          {calculateFinalResults(scores.trickScores).map(
            (playerScore, index) => (
              <li key={index}>
                <span className="position">{playerScore.position}</span>
                <span className="player">{playerScore.player}</span>
                <span className="points">{playerScore.points}</span>
                <span className="trophy">{playerScore.isWinner && '🏆'}</span>
              </li>
            )
          )}
        </ul>
      )}

      <ScoreSheet scores={scores} />
    </div>
  );
};
