import { HandEntity } from './domain/hand-entity';
import { Card } from './types/card';
import cors from 'cors';
import express from 'express';
import * as statuses from 'http-status-codes';
import morgan from 'morgan';
import * as WebSocket from 'ws';
import * as http from 'http';
import { TrickCards } from './types/trick-cards';

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
    client.send(JSON.stringify(trick));
  });
};

router.get('/hands/current/statute', (_req, res) => {
  res.send(hand.getStatute());
});

router.get('/cards', (req, res) => {
  const player = { name: req.query.player as string };
  res.send(hand.getCards(player));
});

router.delete('/cards', (req, res) => {
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

router.get('/tricks', (req, res) => {
  try {
    res.send(hand.getCurrentTrick());
  } catch (err) {
    res.sendStatus(err);
  }
});

router.post('/tricks', (req, res) => {
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

router.post('/tricks/cards', (req, res) => {
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

router.get('/hands/current/trick-count', (_req, res) => {
  res.send(hand.getPlayersTrickCount());
});

router.get('/hands/current/tablecards', (_req, res) => {
  res.send(hand.getTableCards());
});

router.get('/game/score', (_req, res) => {
  try {
    // TODO
    res.sendStatus(statuses.NO_CONTENT);
  } catch (err) {
    res.send(err);
  }
});

// TODO remove when no longer needed
router.get('/hand/reset', (_req, res) => {
  hand = newHand();
  res.sendStatus(statuses.NO_CONTENT);
});

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

/*
setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 1000);*/

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', router);

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
