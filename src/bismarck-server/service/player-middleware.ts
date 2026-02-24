import { GamePlayerRequest } from './game-player-request';
import * as express from 'express';
import StatusCodes from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { Player } from '../../types/player';

interface JwtPayloadWithPlayer {
  player: Player;
}

export const playerExtractor = (
  req: GamePlayerRequest,
  res: express.Response,
  next: () => void
): void => {
  const authHeader = req.headers.authorization;

  if (!!authHeader && authHeader !== 'Bearer') {
    const token = authHeader.split(' ')[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    jwt.verify(
      token,
      secret,
      (
        err: jwt.VerifyErrors | null,
        decoded: JwtPayloadWithPlayer | undefined
      ) => {
        if (err) {
          res.sendStatus(StatusCodes.FORBIDDEN);
          return;
        }
        req.player = decoded.player;
        next();
      }
    );
  } else {
    res.sendStatus(StatusCodes.UNAUTHORIZED);
  }
};
