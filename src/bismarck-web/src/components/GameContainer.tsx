import { PlayersHand } from './PlayersHand';
import { StatuteSummary } from './Statute';
import { TableCards } from './TableCards';
import { TotalScore } from './TotalScore';
import { Trick } from './Trick';
import { TrickTakers } from './TrickTakers';
import { Card } from '../../../types/card';
import { PlayerScore } from '../../../types/player-score';
import { TrickCards } from '../../../types/trick-cards';
import { GameContext } from '../GameContext';
import { SocketFactory } from '../services/socket-factory';
import * as React from 'react';

export const GameContainer = () => {
  const game = React.useContext(GameContext);

  const [tableCards, setTableCards] = React.useState<Card[]>([]);
  const [handCards, setHandCards] = React.useState<Card[]>([]);
  const [trickCards, setTrickCards] = React.useState<TrickCards>({
    cards: [],
  });
  const [trickTakers, setTrickTakers] = React.useState<PlayerScore[]>([]);

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

  const fetchHandCards = async (): Promise<Card[]> => {
    const resp = await fetch(
      `${process.env.REACT_APP_API_URL}/api/games/${game.gameId}/hand/cards?player=${game.player}`,
      {
        mode: 'cors',
      }
    );
    return (await resp.json()) as Card[];
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

  const tableCardsAreVisible = (trickCards: TrickCards): boolean => {
    // TODO: check if hand has any previous tricks
    return trickCards.cards.filter((tc) => !!tc.card).length === 0;
  };

  React.useEffect(() => {
    fetchTableCards().then((cards) => {
      setTableCards(cards);
    });
    fetchHandCards().then((cards) => {
      setHandCards(cards);
    });
    fetchTrickTakers().then((takers) => {
      setTrickTakers(takers);
    });
    socket.onmessage = (msg) => {
      const trick = JSON.parse(msg.data) as TrickCards;
      setTrickCards(trick);
      if (!trick.cards.filter((tc) => !tc.card).length) {
        fetchTrickTakers().then((takers) => {
          setTrickTakers(takers);
        });
      }
    };
  }, []);

  React.useEffect(() => () => socket.close(), [socket]);

  return (
    <div>
      <Trick trickCards={trickCards} />
      <PlayersHand cards={handCards} />
      <TableCards cards={tableCards} show={tableCardsAreVisible(trickCards)} />
      <div className="score-board">
        <StatuteSummary />
        <TrickTakers trickTakers={trickTakers} />
        <TotalScore />
      </div>
    </div>
  );
};
