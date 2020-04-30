import { HandEntity } from './domain/hand-entity';
import { Card } from './types/card';
import { TrickCards } from './types/trick-cards';
import cors from 'cors';
import express from 'express';
import * as http from 'http';
import * as statuses from 'http-status-codes';
import morgan from 'morgan';
import url from 'url';
import { v4 as uuid } from 'uuid';
import * as WebSocket from 'ws';

const app = express();

const server = http.createServer(app);

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

const publishTrick = (trick: TrickCards) => {
  wss.clients.forEach((client) => {
    console.log(client);
    client.send(JSON.stringify(trick));
  });
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
    publishTrick(trick);
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
    publishTrick(trick);
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

wss.on('connection', (ws: any, req: Request) => {
  console.log('Client connected');

  const parameters = url.parse(req.url, true);

  const uid = uuid();
  ws.uid = uid;

  ws.chatRoom = { uid: parameters.query.myCustomID };
  ws.hereMyCustomParameter = parameters.query.myCustomParam;

  console.log(ws);

  ws.on('close', () => console.log('Client disconnected'));
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', router);

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
