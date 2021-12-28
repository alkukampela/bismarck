import { GameTypeChooser } from './GameTypeChooser';
import { HandTitle } from './HandTitle';
import { PlayersCards } from './PlayersCards';
import { StatuteSummary } from './Statute';
import { TableCards } from './TableCards';
import { OnGoingGameScore } from './OnGoingGameScore';
import { Trick } from './Trick';
import { TrickTakers } from './TrickTakers';
import { Card } from '../../../types/card';
import { GameScoreBoard } from '../../../types/game-score-board';
import { HandStatute } from '../../../types/hand-statute';
import { PlayerScore } from '../../../types/player-score';
import { PlayersHand } from '../../../types/players-hand';
import { TrickResponse, TrickStatus } from '../../../types/trick-response';
import { GameContext } from '../GameContext';
import { SocketFactory } from '../services/socket-factory';
import * as React from 'react';
import {
  fetchTrickTakers,
  fetchScores,
  fetchTableCards,
  fetchPlayersHand,
  fetchStatute,
} from '../services/api-service';
import {
  emptyHand,
  emptyScores,
  emptyTrickResponse,
  emptyStatue,
} from '../domain/default-objects';
import { FinalScores } from './FinalScores';
import { HandScores } from './HandScores';

export const Game = () => {
  const game = React.useContext(GameContext);

  const [tableCards, setTableCards] = React.useState<Card[]>([]);
  const [playersHand, setPlayersHand] = React.useState<PlayersHand>(emptyHand);
  const [trickResponse, setTrickResponse] =
    React.useState<TrickResponse>(emptyTrickResponse);
  const [trickTakers, setTrickTakers] = React.useState<PlayerScore[]>([]);
  const [scores, setScores] = React.useState<GameScoreBoard>(emptyScores);
  const [statute, setStatute] = React.useState<HandStatute>(emptyStatue);

  const socket = SocketFactory.getSocket(game.gameId);

  const tableCardsAreVisible = (): boolean => {
    return !trickResponse.cards.some((tc) => !!tc.card);
  };

  const isHandReady = (
    trick: TrickResponse,
    handStatute: HandStatute
  ): boolean =>
    isTrickReady(trick) &&
    !!trick.trickNumber &&
    trick.trickNumber + 1 >= handStatute.tricksInHand;

  const isTrickReady = (trick: TrickResponse): boolean =>
    trick.trickStatus === TrickStatus.FINISHED;

  const isFirstCardAfterChoice = (trick: TrickResponse): boolean => {
    return (
      trick.trickNumber === 0 &&
      trick.cards.filter((tc) => !!tc.card).length === 1
    );
  };

  const updateTableCards = () => {
    fetchTableCards(game.gameId).then((cards) => {
      setTableCards(cards);
    });
  };

  const updateHand = () => {
    if (!!game.token) {
      fetchPlayersHand(game.token, game.gameId, emptyHand).then((hand) => {
        setPlayersHand(hand);
      });
    }
  };

  const updateTrickTakers = () => {
    fetchTrickTakers(game.gameId).then((takers) => {
      setTrickTakers(takers);
    });
  };

  const updateTotalScores = () => {
    fetchScores(game.gameId, emptyScores).then((fetchedScores) => {
      setScores(fetchedScores);
    });
  };

  const updateStatute = () => {
    fetchStatute(game.gameId, emptyStatue).then((fetchedStatute) => {
      setStatute(fetchedStatute);
    });
  };

  React.useEffect(() => {
    updateTableCards();
    updateHand();
    updateTrickTakers();
    updateTotalScores();
    updateStatute();

    socket.onmessage = (msg) => {
      const trick = JSON.parse(msg.data) as TrickResponse;
      setTrickResponse(trick);

      if (isFirstCardAfterChoice(trick)) {
        updateStatute();
      }

      if (isTrickReady(trick)) {
        updateTrickTakers();
      }

      if (isHandReady(trick, statute)) {
        updateTotalScores();
      }

      if (trick.trickStatus === TrickStatus.HAND_NOT_STARTED) {
        updateTableCards();
        updateHand();
        updateStatute();
        updateTrickTakers();
      }
    };
  }, []);

  React.useEffect(() => () => socket.close(), [socket]);

  return (
    <>
      <HandTitle
        handStatute={statute}
        trickNumber={trickResponse.trickNumber}
      />
      <Trick trickResponse={trickResponse} />
      <GameTypeChooser handStatute={statute} player={game.player} />
      <TableCards cards={tableCards} show={tableCardsAreVisible()} />
      <PlayersCards
        hand={playersHand}
        trickStatus={trickResponse.trickStatus}
      />
      <div className="score-board">
        <StatuteSummary statute={statute} />
        <TrickTakers trickTakers={trickTakers} />
        <OnGoingGameScore scores={scores} />
      </div>
      <HandScores
        scores={scores}
        isHandReady={isHandReady(trickResponse, statute)}
      />
      <FinalScores scores={scores} />
    </>
  );
};
