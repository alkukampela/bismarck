import express from 'express';
import { Player } from '../types/player';

export interface PlayerRequest extends express.Request {
  player: Player;
}
