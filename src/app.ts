import { CardManager } from './domain/card-manager';
import { createGameAndInvitatePlayers } from './domain/game-creation-service';
import { getTotalScores } from './domain/game-score-manager';
import { initHand } from './domain/game-service';
import { HandService } from './domain/hand-service';
import { StorageService } from './persistence/storage-service';
import { playerExtractor } from './service/auth-middleware';
import { PlayerRequest } from './service/player-request';
import { tokenFor } from './service/token-service';
import { Card } from './types/card';
import { GameTypeChoice } from './types/game-type-choice';
import { RegisterPlayer } from './types/register-player';
import { TrickResponse } from './types/trick-response';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import * as http from 'http';
import * as statuses from 'http-status-codes';
import morgan from 'morgan';
import * as path from 'path';
import url from 'url';
import * as WebSocket from 'ws';

const app = express();

const server = http.createServer(app);

let reactPath: string;
if (process.env.NODE_ENV === 'production') {
  reactPath = path.join(__dirname, 'public');
} else {
  dotenv.config();
  reactPath = path.join(__dirname, 'bismarck-web/dist');
}
app.use(express.static(reactPath));

const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 3001;
const router = express.Router();

const storageService = StorageService.getInstance();
const hand = new HandService(
  storageService,
  CardManager.getInstance(storageService)
);

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
    hand
      .getStatute(req.params.id)
      .then((statute) => {
        res.send(statute);
      })
      .catch((err) => {
        res.status(statuses.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.post(
  '/games/:id/hand/statute',
  playerExtractor,
  (req: PlayerRequest, res: express.Response) => {
    const gameTypeChoice = req.body as GameTypeChoice;

    hand
      .chooseGameType(req.player, gameTypeChoice, req.params.id)
      .then((statute) => {
        res.send(statute);
      })
      .catch((err) => {
        res.status(statuses.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.get(
  '/games/:id/hand/cards',
  playerExtractor,
  async (req: PlayerRequest, res: express.Response) => {
    const cards = await hand.getPlayersHand(req.player, req.params.id);
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

    hand
      .removeCard(req.player, card, req.params.id)
      .then(() => {
        res.sendStatus(statuses.NO_CONTENT);
      })
      .catch((err) => {
        res.status(statuses.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.get(
  '/games/:id/hand/trick',
  (req: express.Request, res: express.Response) => {
    hand.getCurrentTrick(req.params.id).then((trick) => res.send(trick));
  }
);

router.post(
  '/games/:id/hand/trick',
  playerExtractor,
  async (req: PlayerRequest, res: express.Response) => {
    const card = req.body as Card;

    hand
      .startTrick(req.player, card, req.params.id)
      .then((trick) => {
        publishTrick(trick, req.params.id);
        res.send(trick);
      })
      .catch((err) => {
        res.status(statuses.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.post(
  '/games/:id/hand/trick/cards',
  playerExtractor,
  (req: PlayerRequest, res: express.Response) => {
    const card = req.body as Card;

    hand
      .addCardToTrick(req.player, card, req.params.id)
      .then((trick) => {
        publishTrick(trick, req.params.id);
        res.send(trick);
      })
      .catch((err) => {
        res.status(statuses.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.get(
  '/games/:id/hand/trick-count',
  async (req: express.Request, res: express.Response) => {
    hand.getHandsTrickCounts(req.params.id).then((scores) => {
      res.send(scores);
    });
  }
);

router.get(
  '/games/:id/hand/tablecards',
  (req: express.Request, res: express.Response) => {
    hand.getTableCards(req.params.id).then((cards) => res.send(cards));
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
      res.status(statuses.BAD_REQUEST).send({ error: err.message });
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
        res.status(statuses.BAD_REQUEST).send({ error: err.message });
      });
  }
);

router.get('/tokens/:id', (req: express.Request, res: express.Response) => {
  tokenFor(req.params.id)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.status(statuses.BAD_REQUEST).send({ error: err.message });
    });
});

wss.on('connection', (ws: WebSocketWithGameId, req: Request) => {
  console.log('Client connected');

  const parameters = url.parse(req.url, true);

  ws.gameId = parameters.query.gameId as string;

  hand.getCurrentTrick(ws.gameId).then((trick) => {
    ws.send(JSON.stringify(trick));
  });

  ws.on('close', () => console.log('Client disconnected'));
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', router);
app.get('*', (_req, res) => {
  res.sendFile(`${reactPath}/index.html`);
});

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
