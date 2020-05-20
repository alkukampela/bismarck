import { PlayersCards } from './PlayersCards';
import { StatuteSummary } from './Statute';
import { TableCards } from './TableCards';
import { TotalScore } from './TotalScore';
import { Trick } from './Trick';
import { TrickTakers } from './TrickTakers';
import { Card } from '../../../types/card';
import { PlayerScore } from '../../../types/player-score';
import { PlayersHand } from '../../../types/players-hand';
import { TrickCards } from '../../../types/trick-cards';
import { GameContext } from '../GameContext';
import { SocketFactory } from '../services/socket-factory';
import * as React from 'react';
import { GameScoreBoard } from '../../../types/game-score-board';

export const GameContainer = () => {
  const game = React.useContext(GameContext);

  const emptyScores: GameScoreBoard = {
    trickScores: [],
    totalScore: [],
  };

  const [tableCards, setTableCards] = React.useState<Card[]>([]);
  const [playersHand, setPlayersHand] = React.useState<PlayersHand>({
    cards: [],
    extraCards: 0,
  });
  const [trickCards, setTrickCards] = React.useState<TrickCards>({
    cards: [],
  });
  const [trickTakers, setTrickTakers] = React.useState<PlayerScore[]>([]);
  const [scores, setScores] = React.useState<GameScoreBoard>(emptyScores);

  const socket = SocketFactory.getSocket(game.gameId);

  const fetchTableCards = async (): Promise<Card[]> => {
    const resp = await fetch(
      `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/tablecards`,
      {
        mode: 'cors',
      }
    );
    return (await resp.json()) as Card[];
  };

  const fetchHand = async (): Promise<PlayersHand> => {
    const resp = await fetch(
      `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/cards?player=${game.player}`,
      {
        mode: 'cors',
      }
    );
    return (await resp.json()) as PlayersHand;
  };

  const fetchTrickTakers = async (): Promise<PlayerScore[]> => {
    const resp = await fetch(
      `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/trick-count`,
      {
        mode: 'cors',
      }
    );
    return resp.ok ? ((await resp.json()) as PlayerScore[]) : [];
  };

  const fetchScores = async (): Promise<GameScoreBoard> => {
    const resp = await fetch(
      `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/score`,
      {
        mode: 'cors',
      }
    );
    return resp.ok ? ((await resp.json()) as GameScoreBoard) : emptyScores;
  };

  const tableCardsAreVisible = (trickCards: TrickCards): boolean => {
    // TODO: check if hand has any previous tricks
    return trickCards.cards.filter((tc) => !!tc.card).length === 0;
  };

  const updateTrickTakers = () => {
    fetchTrickTakers().then((takers) => {
      setTrickTakers(takers);
    });
  };

  const updateTotalScores = () => {
    fetchScores().then((scores) => {
      setScores(scores);
    });
  };

  React.useEffect(() => {
    fetchTableCards().then((cards) => {
      setTableCards(cards);
    });
    fetchHand().then((hand) => {
      setPlayersHand(hand);
    });
    updateTrickTakers();
    updateTotalScores();

    socket.onmessage = (msg) => {
      const trick = JSON.parse(msg.data) as TrickCards;
      setTrickCards(trick);
      if (!trick.cards.filter((tc) => !tc.card).length) {
        updateTrickTakers();
        // TODO: this is fetched too often
        updateTotalScores();
      }
    };
  }, []);

  React.useEffect(() => () => socket.close(), [socket]);

  return (
    <div>
      <Trick trickCards={trickCards} />
      <PlayersCards hand={playersHand} />
      <TableCards cards={tableCards} show={tableCardsAreVisible(trickCards)} />
      <div className="score-board">
        <StatuteSummary />
        <TrickTakers trickTakers={trickTakers} />
        <TotalScore scores={scores} />
      </div>
    </div>
  );
};
