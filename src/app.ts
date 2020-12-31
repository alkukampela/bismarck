import { createGameAndInvitatePlayers } from './domain/game-creation-service';
import { getTotalScores } from './domain/game-score-manager';
import { initHand } from './domain/game-service';
import { playerExtractor } from './service/auth-middleware';
import { PlayerRequest } from './service/player-request';
import { sendRecoverySms } from './service/sms-recovery-service';
import { tokenForLoginId } from './service/token-service';
import { Card } from './types/card';
import { GameTypeChoice } from './types/game-type-choice';
import { RegisterPlayer } from './types/register-player';
import { SmsRecovery } from './types/sms-recovery';
import { TrickResponse } from './types/trick-response';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
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

const app = express();

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
  (req: express.Request, res: express.Response) => {
    getStatute(req.params.id)
      .then((statute) => {
        res.send(statute);
      })
      .catch((err) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.post(
  '/games/:id/hand/statute',
  playerExtractor,
  (req: PlayerRequest, res: express.Response) => {
    const gameTypeChoice = req.body as GameTypeChoice;

    chooseGameType(req.player, gameTypeChoice, req.params.id)
      .then((statute) => {
        res.send(statute);
      })
      .catch((err) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.get(
  '/games/:id/hand/cards',
  playerExtractor,
  async (req: PlayerRequest, res: express.Response) => {
    const cards = await getPlayersHand(req.player, req.params.id);
    res.send(cards);
  }
);

router.delete(
  '/games/:id/hand/cards',
  playerExtractor,
  async (req: PlayerRequest, res: express.Response) => {
    const card: Card = {
      rank: req.query.rank as string,
      suit: req.query.suit as string,
    };
    removePlayersCard(req.player, card, req.params.id)
      .then(() => {
        res.sendStatus(StatusCodes.NO_CONTENT);
      })
      .catch((err) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.get(
  '/games/:id/hand/trick',
  (req: express.Request, res: express.Response) => {
    getCurrentTrick(req.params.id).then((trick) => res.send(trick));
  }
);

router.post(
  '/games/:id/hand/trick',
  playerExtractor,
  async (req: PlayerRequest, res: express.Response) => {
    const card = req.body as Card;

    startTrick(req.player, card, req.params.id)
      .then((trick) => {
        publishTrick(trick, req.params.id);
        res.send(trick);
      })
      .catch((err) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.post(
  '/games/:id/hand/trick/cards',
  playerExtractor,
  (req: PlayerRequest, res: express.Response) => {
    const card = req.body as Card;

    addCardToTrick(req.player, card, req.params.id)
      .then((trick) => {
        publishTrick(trick, req.params.id);
        res.send(trick);
      })
      .catch((err) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.get(
  '/games/:id/hand/trick-count',
  async (req: express.Request, res: express.Response) => {
    getHandsTrickCounts(req.params.id).then((scores) => {
      res.send(scores);
    });
  }
);

router.get(
  '/games/:id/hand/tablecards',
  (req: express.Request, res: express.Response) => {
    getTableCards(req.params.id).then((cards) => res.send(cards));
  }
);

router.get(
  '/games/:id/score',
  (req: express.Request, res: express.Response) => {
    getTotalScores(req.params.id).then((scores) => res.send(scores));
  }
);

router.post('/games', (req: express.Request, res: express.Response) => {
  const players = req.body.players as RegisterPlayer[];
  createGameAndInvitatePlayers(players)
    .then((game) => res.send(game))
    .catch((err) => {
      res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
    });
});

router.post(
  '/games/:id/hand',
  (req: express.Request, res: express.Response) => {
    initHand(req.params.id)
      .then((statute) => {
        publishTrick({ cards: [], trickNumber: 0 }, req.params.id);
        res.send(statute);
      })
      .catch((err) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.get(
  '/tokens/:loginId',
  (req: express.Request, res: express.Response) => {
    tokenForLoginId(req.params.loginId)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.post('/sms-recovery', (req: express.Request, res: express.Response) => {
  const smsRecovery = req.body as SmsRecovery;
  sendRecoverySms(smsRecovery)
    .then(() => {
      res.sendStatus(StatusCodes.NO_CONTENT);
    })
    .catch((err) => {
      res.status(StatusCodes.BAD_REQUEST).send({ error: err.message });
    });
});

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
