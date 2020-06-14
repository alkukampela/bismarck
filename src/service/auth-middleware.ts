import { PlayerRequest } from './player-request';
import { GamePlayer } from '../persistence/game-player';
import * as express from 'express';
import * as statuses from 'http-status-codes';
import { verify, VerifyErrors } from 'jsonwebtoken';

export const playerExtractor = (
  req: PlayerRequest,
  res: express.Response,
  next: () => void
) => {
  const authHeader = req.headers.authorization;

  if (!!authHeader && authHeader !== 'Bearer') {
    const token = authHeader.split(' ')[1];

    verify(
      token,
      process.env.JWT_SECRET,
      (err: VerifyErrors, gamePlayer: GamePlayer) => {
        if (!!err) {
          res.sendStatus(statuses.FORBIDDEN);
          return;
        }
        req.player = gamePlayer.player;
        next();
      }
    );
  } else {
    res.sendStatus(statuses.UNAUTHORIZED);
  }
};
