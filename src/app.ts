import { HandEntity } from './domain/hand-entity';
import { Card } from './types/card';
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

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
} else {
  app.use(express.static(path.join(__dirname, 'bismarck-web/dist')));
}

const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 3001;
const router = express.Router();

function newHand() {
  return new HandEntity(
    [
      { name: 'Reijo' },
      { name: 'Kaija' },
      { name: 'Tuulikki' },
      { name: 'Yrjö' },
    ],
    0
  );
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
  res.send(hand.getStatute());
});

router.get('/games/:id/hand/cards', (req, res) => {
  const player = { name: req.query.player as string };
  res.send(hand.getCards(player));
});

router.delete('/games/:id/hand/cards', (req, res) => {
  try {
    const player = { name: req.query.player as string };

    const card: Card = {
      rank: req.query.rank as string,
      suit: req.query.suit as string,
    };

    hand.removeCard(player, card);
    res.sendStatus(204);
  } catch (err) {
    res.status(statuses.BAD_REQUEST).send({ error: err.message });
  }
});

router.get('/games/:id/hand/trick', (req, res) => {
  try {
    res.send(hand.getCurrentTrick());
  } catch (err) {
    res.sendStatus(err);
  }
});

router.post('/games/:id/hand/trick', (req, res) => {
  try {
    const player = { name: req.query.player as string };
    const card = req.body as Card;

    const trick = hand.startTrick(player, card);
    publishTrick(trick, req.params.id);
    res.send(trick);
  } catch (err) {
    res.status(statuses.BAD_REQUEST).send({ error: err.message });
  }
});

router.post('/games/:id/hand/trick/cards', (req, res) => {
  try {
    const player = { name: req.query.player as string };
    const card = req.body as Card;
    const trick = hand.addCardToTrick(player, card);
    publishTrick(trick, req.params.id);
    res.send(trick);
  } catch (err) {
    res.status(statuses.BAD_REQUEST).send({ error: err.message });
  }
});

router.get('/games/:id/hand/trick-count', (_req, res) => {
  res.send(hand.getPlayersTrickCount());
});

router.get('/games/:id/hand/tablecards', (_req, res) => {
  res.send(hand.getTableCards());
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
  ws.send(JSON.stringify(hand.getCurrentTrick()));

  ws.on('close', () => console.log('Client disconnected'));
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', router);

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
