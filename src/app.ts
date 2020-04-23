import express from 'express';
import * as statuses from 'http-status-codes';

import cors from 'cors';
import { HandEntity } from './domain/hand-entity';
import { Card } from './types/card';

const app = express();
const port = 3001;
const router = express.Router();

let hand = newHand();

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
    res.sendStatus(err);
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
    res.send(hand.startTrick(player, card));
  } catch (err) {
    res.sendStatus(err);
  }
});

router.post('/tricks/cards', (req, res) => {
  try {
    const player = { name: req.query.player as string };
    const card = req.body as Card;
    res.send(hand.addCardToTrick(player, card));
  } catch (err) {
    res.sendStatus(err);
  }
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

app.use(cors());
app.use(express.json());
app.use('/api', router);
app.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});

function newHand() {
  return new HandEntity(
    [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }],
    4
  );
}
