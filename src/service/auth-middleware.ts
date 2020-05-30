import * as express from 'express';
import { PlayerRequest } from './player-request';

export const playerExtractor = (
  req: PlayerRequest,
  res: express.Response,
  next
) => {
  if (req.query.player) {
    req.player = { name: req.query.player as string };
    next();
    return;
  }

  res.sendStatus(401);
};
