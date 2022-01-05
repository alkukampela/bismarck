import { calculateFinalResults } from '../domain/score-calculators';
import { GameScoreBoard } from '../../../types/game-score-board';
import { emptyScores } from '../domain/default-objects';
import { fetchScores } from '../services/api-service';
import { extractGameId } from '../services/game-id-extractor';
import { ScoreSheet } from './ScoreSheet';
import * as React from 'react';

export const Results = () => {
  const [scores, setScores] = React.useState<GameScoreBoard>(emptyScores);

  React.useEffect(() => {
    const gameId = extractGameId(document);

    fetchScores(gameId, emptyScores).then((fetchedScores) => {
      setScores(fetchedScores);
    });
  }, []);

  return (
    <div>
      <h1>{scores.isFinished ? 'Lopputulokset' : 'Tilanne'}</h1>

      {scores.isFinished && (
        <ul className="final-scores-list">
          {calculateFinalResults(scores.trickScores).map(
            (playerScore, index) => (
              <li key={index}>
                {playerScore.position} {playerScore.player} {playerScore.points}
                {playerScore.position === 'I' && ' 🏆'}
              </li>
            )
          )}
        </ul>
      )}

      <ScoreSheet scores={scores} />
    </div>
  );
};
