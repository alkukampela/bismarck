import express from 'express';

export interface GameRequest extends express.Request {
  gameId: string;
}
