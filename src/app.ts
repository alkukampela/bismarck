import { CardManager } from './domain/card-manager';
import { getTotalScores } from './domain/game-score-manager';
import { createGame, initHand } from './domain/game-service';
import { HandService } from './domain/hand-service';
import { StorageService } from './persistence/storage-service';
import { Card } from './types/card';
import { GameTypeChoice } from './types/game-type-choice';
import { Player } from './types/player';
import { TrickCards } from './types/trick-cards';
import cors from 'cors';
import express from 'express';
import * as http from 'http';
import * as statuses from 'http-status-codes';
import morgan from 'morgan';
import * as path from 'path';
import url from 'url';
import * as WebSocket from 'ws';
import { RegisterPlayer } from './types/register-player';
import { createGameAndInvitatePlayers } from './domain/game-creation-service';

const app = express();

const server = http.createServer(app);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
} else {
  app.use(express.static(path.join(__dirname, 'bismarck-web/dist')));
}

const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 3001;
const router = express.Router();

const storageService = StorageService.getInstance();
const hand = new HandService(
  storageService,
  CardManager.getInstance(storageService)
);

function playerFromQueryString(req): Player {
  return { name: req.query.player as string };
}

type WebSocketWithGameId = WebSocket & {
  gameId: string;
};

const publishTrick = (trick: TrickCards, gameId: string) => {
  let cc = 0;
  wss.clients.forEach((client: WebSocketWithGameId) => {
    if (client.gameId === gameId) {
      client.send(JSON.stringify(trick));
    }
    ++cc;
  });
  console.log(`clients: ${cc}`);
};

router.get('/games/:id/hand/statute', (req, res) => {
  hand
    .getStatute(req.params.id)
    .then((statute) => {
      res.send(statute);
    })
    .catch((err) => {
      res.status(statuses.BAD_REQUEST).send({ error: err.message });
    });
});

router.post('/games/:id/hand/statute', (req, res) => {
  const player = playerFromQueryString(req);
  const gameTypeChoice = req.body as GameTypeChoice;

  hand
    .chooseGameType(player, gameTypeChoice, req.params.id)
    .then((statute) => {
      res.send(statute);
    })
    .catch((err) => {
      res.status(statuses.BAD_REQUEST).send({ error: err.message });
    });
});

router.get('/games/:id/hand/cards', async (req, res) => {
  const player = playerFromQueryString(req);
  const cards = await hand.getPlayersHand(player, req.params.id);
  res.send(cards);
});

router.delete('/games/:id/hand/cards', async (req, res) => {
  const player = playerFromQueryString(req);
  const card: Card = {
    rank: req.query.rank as string,
    suit: req.query.suit as string,
  };

  hand
    .removeCard(player, card, req.params.id)
    .then(() => {
      res.sendStatus(statuses.NO_CONTENT);
    })
    .catch((err) => {
      res.status(statuses.BAD_REQUEST).send({ error: err.message });
    });
});

router.get('/games/:id/hand/trick', (req, res) => {
  hand.getCurrentTrick(req.params.id).then((trick) => res.send(trick));
});

router.post('/games/:id/hand/trick', async (req, res) => {
  const player = playerFromQueryString(req);
  const card = req.body as Card;

  hand
    .startTrick(player, card, req.params.id)
    .then((trick) => {
      publishTrick(trick, req.params.id);
      res.send(trick);
    })
    .catch((err) => {
      res.status(statuses.BAD_REQUEST).send({ error: err.message });
    });
});

router.post('/games/:id/hand/trick/cards', (req, res) => {
  const player = playerFromQueryString(req);
  const card = req.body as Card;

  hand
    .addCardToTrick(player, card, req.params.id)
    .then((trick) => {
      publishTrick(trick, req.params.id);
      res.send(trick);
    })
    .catch((err) => {
      res.status(statuses.BAD_REQUEST).send({ error: err.message });
    });
});

router.get('/games/:id/hand/trick-count', async (req, res) => {
  hand.getHandsTrickCounts(req.params.id).then((scores) => {
    res.send(scores);
  });
});

router.get('/games/:id/hand/tablecards', (req, res) => {
  hand.getTableCards(req.params.id).then((cards) => res.send(cards));
});

router.get('/games/:id/score', (req, res) => {
  getTotalScores(req.params.id).then((scores) => res.send(scores));
});

router.post('/games/:id', (req, res) => {
  const players = req.body.players as Player[];
  const handNumber = parseInt(req.query.hand as string, 10);
  createGame(req.params.id, players, handNumber)
    .then((game) => res.send(game))
    .catch(() => {
      res.sendStatus(statuses.BAD_REQUEST);
    });
});

router.post('/games', (req, res) => {
  const players = req.body.players as RegisterPlayer[];
  createGameAndInvitatePlayers(players)
    .then((game) => res.send(game))
    .catch((err) => {
      res.status(statuses.BAD_REQUEST).send({ error: err.message });
    });
});

router.post('/games/:id/hand', (req, res) => {
  initHand(req.params.id)
    .then((statute) => {
      publishTrick({ cards: [] }, req.params.id);
      res.send(statute);
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

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
