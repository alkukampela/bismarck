import express from 'express';
import shuffle from 'fisher-yates';

import { Hand } from './models/hand';

const app = express();
const port = 3000;

const hand = new Hand(shuffledDeck(), 0);

app.get('/cards', (req, res) => {
  try {
    const player = Number(req.query.player);
    res.send(hand.getCards(player));
  } catch (err) {
    res.send(err);
  }
});


app.delete('/cards', (req, res) => {
  try {
    const player = Number(req.query.player);
    const rank = req.query.rank;
    const suit = req.query.suit;
    const result = hand.removeCard(player, rank, suit);
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

app.listen(port, err => {
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

  while (currVal < maxVal) yield currVal++;
}
