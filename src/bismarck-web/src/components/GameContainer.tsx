import { GameTypeChooser } from './GameTypeChooser';
import { HandTitle } from './HandTitle';
import { PlayersCards } from './PlayersCards';
import { StatuteSummary } from './Statute';
import { TableCards } from './TableCards';
import { TotalScore } from './TotalScore';
import { Trick } from './Trick';
import { TrickTakers } from './TrickTakers';
import { Card } from '../../../types/card';
import { GameScoreBoard } from '../../../types/game-score-board';
import { HandStatute } from '../../../types/hand-statute';
import { PlayerScore } from '../../../types/player-score';
import { PlayersHand } from '../../../types/players-hand';
import { TrickResponse } from '../../../types/trick-response';
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

export const GameContainer = () => {
  const game = React.useContext(GameContext);

  const [tableCards, setTableCards] = React.useState<Card[]>([]);
  const [playersHand, setPlayersHand] = React.useState<PlayersHand>(emptyHand);
  const [trickResponse, setTrickResponse] = React.useState<TrickResponse>(
    emptyTrickResponse
  );
  const [trickTakers, setTrickTakers] = React.useState<PlayerScore[]>([]);
  const [scores, setScores] = React.useState<GameScoreBoard>(emptyScores);
  const [statute, setStatute] = React.useState<HandStatute>(emptyStatue);

  const socket = SocketFactory.getSocket(game.gameId);

  const tableCardsAreVisible = (): boolean => {
    // TODO: check if hand has any previous tricks
    return trickResponse.cards.filter((tc) => !!tc.card).length === 0;
  };

  const isHandReady = (trick: TrickResponse, handStatute: HandStatute) =>
    isTrickReady(trick) &&
    trick.trickNumber &&
    trick.trickNumber + 1 >= handStatute.tricks;

  const isTrickReady = (trick: TrickResponse) =>
    !trick.cards.filter((tc) => !tc.card).length;

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

  const shouldShowGameChooseType = (
    handStatute: HandStatute,
    player: string
  ): boolean => {
    return (
      player === handStatute.eldestHand.name &&
      handStatute.handType.isChoice &&
      !handStatute.handType.gameType
    );
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
      if (isTrickReady(trick)) {
        updateTrickTakers();
      }
      if (isHandReady(trick, statute)) {
        updateTotalScores();
      }
    };
  }, []);

  React.useEffect(() => () => socket.close(), [socket]);

  return (
    <div>
      <HandTitle
        handStatute={statute}
        trickNumber={trickResponse.trickNumber}
      />
      <Trick trickResponse={trickResponse} />
      {shouldShowGameChooseType(statute, game.player) && <GameTypeChooser />}
      <TableCards cards={tableCards} show={tableCardsAreVisible()} />
      <PlayersCards hand={playersHand} />
      <div className="score-board">
        <StatuteSummary statute={statute} />
        <TrickTakers trickTakers={trickTakers} />
        <TotalScore scores={scores} />
      </div>
    </div>
  );
};
