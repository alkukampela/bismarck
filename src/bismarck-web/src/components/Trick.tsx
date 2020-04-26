import * as React from 'react';
import { TrickCard } from './TrickCard';
import * as TC from '../../../types/trick-cards';
import { PlayerScore } from '../../../types/player-score';

export const Trick = () => {
  const fetchTrick = async function (): Promise<TC.TrickCards> {
    const resp = await fetch(`http://localhost:3001/api/tricks`, {
      mode: 'cors',
    });
    return resp.ok ? ((await resp.json()) as TC.TrickCards) : { cards: [] };
  };

  const fetchScores = async function (): Promise<PlayerScore[]> {
    const resp = await fetch(
      `http://localhost:3001/api/hands/current/trick-count`,
      {
        mode: 'cors',
      }
    );
    return resp.ok ? ((await resp.json()) as PlayerScore[]) : [];
  };

  const [cards, setCards] = React.useState<TC.TrickCards>({
    cards: [],
  });

  const [trickTakers, setTrickTakers] = React.useState<PlayerScore[]>([]);

  React.useEffect(() => {
    setTimeout(() => {
      fetchTrick()
        .then((trick) => setCards(trick))
        .catch();
    }, 1000);
  });

  React.useEffect(() => {
    setTimeout(() => {
      fetchScores()
        .then((takers) => setTrickTakers(takers))
        .catch();
    }, 1000);
  });

  return (
    <div>
      <div className="trick">
        {cards.cards.map((playerCard: TC.TrickCard, index: number) => (
          <TrickCard trickCard={playerCard} key={index} />
        ))}
      </div>
      <hr />
      <div>
        {trickTakers.map((playerScore: PlayerScore, index: number) => (
          <div key={index}>
            <span>{playerScore.player.name}: </span>
            <span>{playerScore.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
