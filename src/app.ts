import { createGameAndInvitatePlayers } from './domain/game-creation-service';
import { getTotalScores } from './domain/game-score-manager';
import { initHand } from './domain/game-service';
import { trickResponseDuringCardRemoval } from './domain/trick-machine';
import { getGameDump, importGameDump } from './service/dev-service';
import { GamePlayerRequest } from './service/game-player-request';
import { GameRequest } from './service/game-request';
import { gameIdExtractor } from './service/game-identifier-middleware';
import { playerExtractor } from './service/player-middleware';
import { tokenForLoginId } from './service/token-service';
import { Card } from './types/card';
import { GameDump } from './types/game-dump';
import { RegisterPlayer } from './types/register-player';
import { TrickResponse } from './types/trick-response';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import * as http from 'http';
import StatusCodes from 'http-status-codes';
import morgan from 'morgan';
import * as path from 'path';
import url from 'url';
import * as WebSocket from 'ws';
import {
  addCardToTrick,
  chooseGameType,
  getCurrentTrick,
  getHandsTrickCounts,
  getPlayersHand,
  getStatute,
  getTableCards,
  removePlayersCard,
  startTrick,
} from './domain/hand-service';
import { GameType } from './types/game-type';
import { Suit } from './types/suit';
import { FetchTokenRequest } from './types/fetch-token-request';

const app = express();
app.use(helmet());

const server = http.createServer(app);

let reactPath: string;
if (process.env.NODE_ENV === 'production') {
  reactPath = path.join(__dirname, 'public');
} else {
  dotenv.config();
  reactPath = path.join(__dirname, 'bismarck-web/dist');
  app.use(cors());
  app.use(morgan('dev'));
}
app.use(express.static(reactPath));

const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 3001;
const router = express.Router();

type WebSocketWithGameId = WebSocket & {
  gameId: string;
};

const publishTrick = (trick: TrickResponse, gameId: string) => {
  wss.clients.forEach((client: WebSocketWithGameId) => {
    if (client.gameId === gameId) {
      client.send(JSON.stringify(trick));
    }
  });
};

router.get(
  '/games/:id/hand/statute',
  gameIdExtractor,
  (req: GameRequest, res: express.Response) => {
    getStatute(req.gameId)
      .then((statute) => {
        res.send(statute);
      })
      .catch((err: Error) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.post(
  '/games/:id/hand/statute',
  playerExtractor,
  gameIdExtractor,
  (req: GamePlayerRequest, res: express.Response) => {
    const gameTypeChoice = {
      gameType: req.body.gameType as GameType,
      trumpSuit: req.body?.trumpSuit as Suit,
    };

    chooseGameType(req.player, gameTypeChoice, req.gameId)
      .then((statute) => {
        publishTrick(trickResponseDuringCardRemoval(), req.gameId);
        res.send(statute);
      })
      .catch((err: Error) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.get(
  '/games/:id/hand/cards',
  playerExtractor,
  gameIdExtractor,
  async (req: GamePlayerRequest, res: express.Response) => {
    const cards = await getPlayersHand(req.player, req.gameId);
    res.send(cards);
  }
);

router.delete(
  '/games/:id/hand/cards',
  playerExtractor,
  gameIdExtractor,
  async (req: GamePlayerRequest, res: express.Response) => {
    const card: Card = {
      rank: req.query.rank as string,
      suit: req.query.suit as string,
    };
    removePlayersCard(req.player, card, req.gameId)
      .then(() => {
        res.sendStatus(StatusCodes.NO_CONTENT);
      })
      .catch((err: Error) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.get(
  '/games/:id/hand/trick',
  gameIdExtractor,
  (req: GameRequest, res: express.Response) => {
    getCurrentTrick(req.gameId).then((trick) => res.send(trick));
  }
);

router.post(
  '/games/:id/hand/trick',
  playerExtractor,
  gameIdExtractor,
  async (req: GamePlayerRequest, res: express.Response) => {
    const card: Card = {
      rank: req.body.rank as string,
      suit: req.body.suit as string,
    };

    startTrick(req.player, card, req.gameId)
      .then((trick) => {
        publishTrick(trick, req.gameId);
        res.send(trick);
      })
      .catch((err: Error) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.post(
  '/games/:id/hand/trick/cards',
  playerExtractor,
  gameIdExtractor,
  (req: GamePlayerRequest, res: express.Response) => {
    const card = req.body as Card;

    addCardToTrick(req.player, card, req.params.id)
      .then((trick) => {
        publishTrick(trick, req.gameId);
        res.send(trick);
      })
      .catch((err: Error) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.get(
  '/games/:id/hand/trick-count',
  gameIdExtractor,
  async (req: GameRequest, res: express.Response) => {
    getHandsTrickCounts(req.gameId).then((scores) => {
      res.send(scores);
    });
  }
);

router.get(
  '/games/:id/hand/tablecards',
  gameIdExtractor,
  (req: GameRequest, res: express.Response) => {
    getTableCards(req.gameId).then((cards) => res.send(cards));
  }
);

router.get(
  '/games/:id/score',
  gameIdExtractor,
  (req: GameRequest, res: express.Response) => {
    getTotalScores(req.gameId).then((scores) => res.send(scores));
  }
);

router.post('/games', (req: express.Request, res: express.Response) => {
  const players = req.body.players as RegisterPlayer[];
  createGameAndInvitatePlayers(players)
    .then((game) => res.send(game))
    .catch((err: Error) => {
      res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
    });
});

router.post(
  '/games/:id/hand',
  gameIdExtractor,
  (req: GameRequest, res: express.Response) => {
    initHand(req.gameId)
      .then((statute) => {
        publishTrick(trickResponseDuringCardRemoval(), req.gameId);
        res.send(statute);
      })
      .catch((err: Error) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.post('/fetch-token', (req: express.Request, res: express.Response) => {
  const request = req.body as FetchTokenRequest;
  tokenForLoginId(request.loginId)
    .then((result) => {
      res.send(result);
    })
    .catch((err: Error) => {
      res.status(StatusCodes.FORBIDDEN).send({ error: err.message });
    });
});

router.get(
  '/dev/:id',
  gameIdExtractor,
  (req: GameRequest, res: express.Response) => {
    getGameDump(req.gameId)
      .then((gameDump) => {
        res.send(gameDump);
      })
      .catch((err: Error) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.post(
  '/dev/:id',
  gameIdExtractor,
  (req: GameRequest, res: express.Response) => {
    const gameDump = req.body as GameDump;
    importGameDump(req.gameId, gameDump)
      .then(() => {
        res.sendStatus(StatusCodes.NO_CONTENT);
      })
      .catch((err: Error) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

wss.on('connection', (ws: WebSocketWithGameId, req: Request) => {
  console.log('Client connected');

  const parameters = url.parse(req.url, true);

  ws.gameId = parameters.query.gameId as string;

  getCurrentTrick(ws.gameId).then((trick) => {
    ws.send(JSON.stringify(trick));
  });

  ws.on('close', () => console.log('Client disconnected'));
});

app.use(express.json());
app.use('/api', router);
app.get('*', (_req, res) => {
  res.sendFile(`${reactPath}/index.html`);
});

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
