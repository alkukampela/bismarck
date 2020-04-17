import express from 'express';
import * as statuses from 'http-status-codes';

import { HandEntity } from './domain/hand-entity';
import { Player } from './domain/player';

const app = express();
const port = 3001;
const router = express.Router();

const hand = new HandEntity([
  new Player('a'),
  new Player('b'),
  new Player('c'),
  new Player('d'),
]);

router.get('/hands/current', (_req, res) => {
  try {
    // TODO
    res.sendStatus(statuses.NO_CONTENT);
  } catch (err) {
    res.send(err);
  }
});

router.get('/cards', (req, res) => {
  const player = new Player(req.query.player as string);
  res.send(hand.getCards(player));
});

router.delete('/cards', (req, res) => {
  try {
    const player = new Player(req.query.player as string);
    const rank = req.query.rank as string;
    const suit = req.query.suit as string;
    hand.removeCard(player, rank, suit);
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
    const player = new Player(req.query.player as string);
    // TODO: use request body instead of query params
    const rank = req.query.rank as string;
    const suit = req.query.suit as string;
    res.send(hand.startTrick(player, rank, suit));
  } catch (err) {
    res.sendStatus(err);
  }
});

router.post('/tricks/cards', (req, res) => {
  try {
    const player = new Player(req.query.player as string);
    // TODO: use request body instead of query params
    const rank = req.query.rank as string;
    const suit = req.query.suit as string;
    res.send(hand.addCardToTrick(player, rank, suit));
  } catch (err) {
    res.sendStatus(err);
  }
});

app.use('/api', router);
app.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});
