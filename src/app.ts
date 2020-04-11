import express from 'express';
import shuffle from 'fisher-yates';

import { Hand } from './models/hand';
import { Player } from './models/player';

const app = express();
const port = 3000;

const hand = new Hand(shuffledDeck(), [
  new Player('a'),
  new Player('b'),
  new Player('c'),
  new Player('d'),
]);

app.get('/hands', (req, res) => {
  try {
    // TODO
    res.sendStatus(204);
  } catch (err) {
    res.send(err);
  }
});

app.get('/cards', (req, res) => {
  try {
    const player = new Player(req.query.player);
    res.send(hand.getCards(player));
  } catch (err) {
    res.send(err);
  }
});

app.delete('/cards', (req, res) => {
  try {
    const player = new Player(req.query.player);
    const rank = req.query.rank;
    const suit = req.query.suit;
    hand.removeCard(player, rank, suit);
    res.sendStatus(204);
  } catch (err) {
    res.sendStatus(err);
  }
});

app.get('/tricks', (req, res) => {
  try {
    res.send(hand.getCurrentTrick());
  } catch (err) {
    res.sendStatus(err);
  }
});

app.post('/tricks', (req, res) => {
  try {
    const player = new Player(req.query.player);
    // TODO: use request body instead of query params
    const rank = req.query.rank;
    const suit = req.query.suit;
    res.send(hand.startTrick(player, rank, suit));
  } catch (err) {
    res.sendStatus(err);
  }
});

app.post('/tricks/cards', (req, res) => {
  try {
    const player = new Player(req.query.player);
    // TODO: use request body instead of query params
    const rank = req.query.rank;
    const suit = req.query.suit;
    res.send(hand.addCardToTrick(player, rank, suit));
  } catch (err) {
    res.sendStatus(err);
  }
});

app.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});

function shuffledDeck() {
  const deck = [...sequenceGenerator(0, 52)];
  return shuffle(deck);
}

function* sequenceGenerator(minVal: number, maxVal: number) {
  let currVal = minVal;
  while (currVal < maxVal) {
    yield currVal++;
  }
}
