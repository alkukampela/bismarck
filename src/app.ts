import { CardManager } from './domain/card-manager';
import { HandEntity } from './domain/hand-entity';
import { StorageService } from './persistence/storage-service';
import { Card } from './types/card';
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

const app = express();

const server = http.createServer(app);

const GAME_ID = '451';

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
} else {
  app.use(express.static(path.join(__dirname, 'bismarck-web/dist')));
}

const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 3001;
const router = express.Router();

function newHand() {
  const handEntity = new HandEntity(
    StorageService.getInstance(),
    CardManager.getInstance(StorageService.getInstance())
  );
  handEntity.setUp(
    [
      { name: 'Reijo' },
      { name: 'Kaija' },
      { name: 'Tuulikki' },
      { name: 'Yrjö' },
    ],
    0,
    GAME_ID
  );
  return handEntity;
}

function playerFromQueryString(req): Player {
  return { name: req.query.player as string };
}

let hand = newHand();

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

router.get('/games/:id/hand/statute', (_req, res) => {
  hand.getStatute(GAME_ID).then((statute) => {
    res.send(statute);
  });
});

router.get('/games/:id/hand/cards', async (req, res) => {
  const player = playerFromQueryString(req);
  const cards = await hand.getCards(player, GAME_ID);
  res.send(cards);
});

router.delete('/games/:id/hand/cards', async (req, res) => {
  const player = playerFromQueryString(req);
  const card: Card = {
    rank: req.query.rank as string,
    suit: req.query.suit as string,
  };

  hand
    .removeCard(player, card, GAME_ID)
    .then(() => {
      res.sendStatus(statuses.NO_CONTENT);
    })
    .catch((err) => {
      res.status(statuses.BAD_REQUEST).send({ error: err.message });
    });
});

router.get('/games/:id/hand/trick', (_req, res) => {
  hand.getCurrentTrick(GAME_ID).then((trick) => res.send(trick));
});

router.post('/games/:id/hand/trick', async (req, res) => {
  const player = playerFromQueryString(req);
  const card = req.body as Card;

  hand
    .startTrick(player, card, GAME_ID)
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
    .addCardToTrick(player, card, GAME_ID)
    .then((trick) => {
      publishTrick(trick, req.params.id);
      res.send(trick);
    })
    .catch((err) => {
      res.status(statuses.BAD_REQUEST).send({ error: err.message });
    });
});

router.get('/games/:id/hand/trick-count', async (_req, res) => {
  hand.getHandsTrickCounts(GAME_ID).then((scores) => res.send(scores));
});

router.get('/games/:id/hand/tablecards', (_req, res) => {
  hand.getTableCards(GAME_ID).then((cards) => res.send(cards));
});

router.get('/games/:id/score', (_req, res) => {
  try {
    // TODO
    res.sendStatus(statuses.NO_CONTENT);
  } catch (err) {
    res.send(err);
  }
});

// TODO remove when no longer needed
router.get('/games/{:id}/reset', (_req, res) => {
  hand = newHand();
  res.sendStatus(statuses.NO_CONTENT);
});

wss.on('connection', (ws: WebSocketWithGameId, req: Request) => {
  console.log('Client connected');

  const parameters = url.parse(req.url, true);

  ws.gameId = parameters.query.gameId as string;

  // TODO: send trick from correct game
  hand.getCurrentTrick(GAME_ID).then((trick) => ws.send(JSON.stringify(trick)));

  ws.on('close', () => console.log('Client disconnected'));
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', router);

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
