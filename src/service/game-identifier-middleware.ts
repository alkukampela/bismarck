import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { ErrorTypes } from '../domain/error-types';
import { GamePlayerRequest } from './game-player-request';
import { GameRequest } from './game-request';

export const gameIdExtractor = (
  req: GameRequest | GamePlayerRequest,
  res: express.Response,
  next: () => void
): void => {
  req.gameId = sanitizeId(req.params.id);

  if (!!req.gameId) {
    next();
    return;
  }

  res
    .status(StatusCodes.BAD_REQUEST)
    .send({ error: ErrorTypes.INVALID_GAME_ID });
};

const sanitizeId = (input: string): string => {
  return input.toLowerCase().replace(/[^a-f\d]+/g, '');
};
