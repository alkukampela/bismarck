import * as express from 'express';
import { verify, VerifyErrors } from 'jsonwebtoken';
import { PlayerRequest } from './player-request';
import { GamePlayer } from '../persistence/game-player';

export const playerExtractor = (
  req: PlayerRequest,
  res: express.Response,
  next
) => {
  const authHeader = req.headers.authorization;

  if (!!authHeader && authHeader !== 'Bearer') {
    const token = authHeader.split(' ')[1];

    verify(
      token,
      process.env.JWT_SECRET,
      (err: VerifyErrors, gamePlayer: GamePlayer) => {
        if (!!err) {
          return res.sendStatus(403);
        }
        req.player = gamePlayer.player;
        next();
      }
    );
  } else if (!!req.query.player) {
    req.player = { name: req.query.player as string };
    next();
  } else {
    res.sendStatus(401);
  }
};
