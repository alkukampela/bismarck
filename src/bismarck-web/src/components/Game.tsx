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
import { HandStatuteResponse } from '../../../types/hand-statute-response';
import { TrickResponse } from '../../../types/trick-response';
import { SocketFactory } from '../services/socket-factory';
import * as React from 'react';
import {
  emptyHand,
  emptyScores,
  emptyTrickResponse,
  emptyStatue,
  emptyTableCardsResponse,
} from '../domain/default-objects';
import { useNavigate } from 'react-router-dom';
import { TableCardsResponse } from '../../../types/table-cards-respons';
import { ApiContext } from '../ApiContext';

export const Game = () => {
  const game = React.useContext(GameContext);
  const api = React.useContext(ApiContext).api;
  const navigate = useNavigate();

  const [tableCards, setTableCards] = React.useState<TableCardsResponse>(
    emptyTableCardsResponse()
  );
  const [playersHand, setPlayersHand] = React.useState<PlayersHand>(emptyHand);
  const [trickResponse, setTrickResponse] =
    React.useState<TrickResponse>(emptyTrickResponse);
  const [trickTakers, setTrickTakers] = React.useState<PlayerScore[]>([]);
  const [scores, setScores] = React.useState<GameScoreBoard>(emptyScores);
  const [statute, setStatute] =
    React.useState<HandStatuteResponse>(emptyStatue);

  const socketRef = React.useRef(SocketFactory.getSocket(game.gameId));

  const isHandStarted = (): boolean => {
    return (
      trickResponse.cards.some((tc) => !!tc.card) ||
      !!trickTakers.filter((tc) => tc.score > 0).length
    );
  };

  const isTrickReady = React.useCallback(
    (trick: TrickResponse): boolean => trick.trickStatus === 'FINISHED',
    []
  );

  const isHandReady = React.useCallback(
    (trick: TrickResponse, handStatute: HandStatuteResponse): boolean =>
      isTrickReady(trick) &&
      !!trick.trickNumber &&
      trick.trickNumber + 1 >= handStatute.tricksInHand,
    [isTrickReady]
  );

  const isFirstCardAfterChoice = React.useCallback(
    (trick: TrickResponse): boolean => {
      return (
        trick.trickNumber === 0 &&
        trick.cards.filter((tc) => !!tc.card).length === 1
      );
    },
    []
  );

  const isMyTurn = React.useCallback((): boolean => {
    if (!game.player) {
      return false;
    }

    if (trickResponse.trickStatus === 'FINISHED') {
      return trickResponse.taker?.name === game.player;
    }

    if (trickResponse.cards.length === 0) {
      return statute.eldestHand.name === game.player;
    }

    const nextPlayer = trickResponse.cards.find((tc) => !tc.card);
    return nextPlayer?.player.name === game.player;
  }, [game.player, statute.eldestHand.name, trickResponse]);

  const updateTrick = React.useCallback(() => {
    api.fetchTrick(game.gameId).then((trick) => {
      setTrickResponse(trick);
    });
  }, [api, game.gameId]);

  const updateTableCards = React.useCallback(() => {
    api.fetchTableCards(game.gameId).then((cards) => {
      setTableCards(cards);
    });
  }, [api, game.gameId]);

  const updateHand = React.useCallback(() => {
    if (game.token) {
      api.fetchPlayersHand(game.token, game.gameId, emptyHand).then((hand) => {
        setPlayersHand(hand);
      });
    }
  }, [api, game.gameId, game.token]);

  const updateTrickTakers = React.useCallback(() => {
    api.fetchTrickTakers(game.gameId).then((takers) => {
      setTrickTakers(takers);
    });
  }, [api, game.gameId]);

  const updateTotalScores = React.useCallback(() => {
    api.fetchScores(game.gameId, emptyScores).then((fetchedScores) => {
      setScores(fetchedScores);
      if (fetchedScores.isFinished) {
        setTimeout(() => {
          navigate(`/results?game=${game.gameId}`);
        }, 3000);
      }
    });
  }, [api, game.gameId, navigate]);

  const updateStatute = React.useCallback(() => {
    api.fetchStatute(game.gameId, emptyStatue).then((fetchedStatute) => {
      setStatute(fetchedStatute);
    });
  }, [api, game.gameId]);

  // Initial backend fetches on mount
  React.useEffect(() => {
    updateTrickTakers();
    updateTableCards();
    updateTrick();
    updateHand();
    updateTotalScores();
    updateStatute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Socket event handling in its own effect
  React.useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
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

      if (trick.trickStatus === 'HAND_NOT_STARTED') {
        updateTableCards();
        updateHand();
        updateStatute();
        updateTrickTakers();
      }
    };
    // Clean up on unmount
    return () => {
      socket.onmessage = null;
    };
  }, [
    isFirstCardAfterChoice,
    isHandReady,
    isTrickReady,
    statute,
    updateHand,
    updateStatute,
    updateTableCards,
    updateTotalScores,
    updateTrickTakers,
  ]);

  React.useEffect(
    () => () => {
      SocketFactory.reset();
    },
    []
  );

  return (
    <>
      <PanicButton />
      <HandTitle handStatute={statute} trickResponse={trickResponse} />
      <TableCards apiResponse={tableCards} show={!isHandStarted()} />
      <GameTypeChooser handStatute={statute} player={game.player} />
      <Trick trickResponse={trickResponse} show={isHandStarted()} />
      <PlayersCards
        hand={playersHand}
        trickStatus={trickResponse.trickStatus}
        isMyTurn={isMyTurn()}
      />
      <ScoreBoard
        statute={statute}
        trickTakers={trickTakers}
        scores={scores}
        trick={trickResponse}
        isMyTurn={isMyTurn()}
      />
      <HandScores
        scores={scores}
        isHandReady={isHandReady(trickResponse, statute)}
      />
    </>
  );
};
