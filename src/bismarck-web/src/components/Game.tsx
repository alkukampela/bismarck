import { GameContext } from '../GameContext';
import { GameScoreBoard } from '../../../types/game-score-board';
import { GameTypeChooser } from './GameTypeChooser';
import { HandScores } from './HandScores';
import { HandTitle } from './HandTitle';
import { PanicButton } from './PanicButton';
import { PlayerScore } from '../../../types/player-score';
import { PlayersCards } from './PlayersCards';
import { PlayersHand } from '../../../types/players-hand';
import { ScoreBoard } from './ScoreBoard';
import { TableCards } from './TableCards';
import { Trick } from './Trick';
import { Card } from '../../../types/card';
import { HandStatute } from '../../../types/hand-statute';
import { TrickResponse, TrickStatus } from '../../../types/trick-response';
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
import { useNavigate } from 'react-router-dom';

export const Game = () => {
  const game = React.useContext(GameContext);
  const navigate = useNavigate();

  const [tableCards, setTableCards] = React.useState<Card[]>([]);
  const [playersHand, setPlayersHand] = React.useState<PlayersHand>(emptyHand);
  const [trickResponse, setTrickResponse] =
    React.useState<TrickResponse>(emptyTrickResponse);
  const [trickTakers, setTrickTakers] = React.useState<PlayerScore[]>([]);
  const [scores, setScores] = React.useState<GameScoreBoard>(emptyScores);
  const [statute, setStatute] = React.useState<HandStatute>(emptyStatue);

  const socket = SocketFactory.getSocket(game.gameId);

  const isHandStarted = (): boolean => {
    return (
      trickResponse.cards.some((tc) => !!tc.card) ||
      !!trickTakers.filter((tc) => tc.score > 0).length
    );
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
      if (fetchedScores.isFinished) {
        setTimeout(() => {
          navigate(`/results?game=${game.gameId}`);
        }, 3000);
      }
    });
  };

  const updateStatute = () => {
    fetchStatute(game.gameId, emptyStatue).then((fetchedStatute) => {
      setStatute(fetchedStatute);
    });
  };

  React.useEffect(() => {
    updateTrickTakers();
    updateTableCards();
    updateHand();
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
      <PanicButton />
      <HandTitle
        handStatute={statute}
        trickNumber={trickResponse.trickNumber}
      />
      <TableCards cards={tableCards} show={!isHandStarted()} />
      <GameTypeChooser handStatute={statute} player={game.player} />
      <Trick trickResponse={trickResponse} show={isHandStarted()} />
      <PlayersCards
        hand={playersHand}
        trickStatus={trickResponse.trickStatus}
      />
      <ScoreBoard statute={statute} trickTakers={trickTakers} scores={scores} />
      <HandScores
        scores={scores}
        isHandReady={isHandReady(trickResponse, statute)}
      />
    </>
  );
};
