import { GamePlayerRequest } from './game-player-request';
import { GamePlayer } from '../persistence/game-player';
import * as express from 'express';
import StatusCodes from 'http-status-codes';
import { verify, VerifyErrors } from 'jsonwebtoken';

export const playerExtractor = (
  req: GamePlayerRequest,
  res: express.Response,
  next: () => void
): void => {
  const authHeader = req.headers.authorization;

  if (!!authHeader && authHeader !== 'Bearer') {
    const token = authHeader.split(' ')[1];

    verify(
      token,
      process.env.JWT_SECRET,
      (err: VerifyErrors, gamePlayer: GamePlayer) => {
        if (!!err) {
          res.sendStatus(StatusCodes.FORBIDDEN);
          return;
        }
        req.player = gamePlayer.player;
        next();
      }
    );
  } else {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
  }
};
