import { TokenResponse } from '../../../types/token-response';
import jwt from '@tsndr/cloudflare-worker-jwt';
import pino from 'pino';
import { GamePlayer } from '../types/game-player';
import { ErrorTypes } from '../types/error-types';
import { loadGamePlayerByLoginId } from './login-token-service';

const logger = pino();

export const generateTokenForPlayer = async (
  gamePlayer: GamePlayer,
  secret: string
): Promise<TokenResponse> => {
  logger.info(
    `Generating token for player: ${gamePlayer.player.name}, game ID: ${gamePlayer.gameId}`
  );

  const payload = {
    ...gamePlayer,
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
  };
  const token = await jwt.sign(payload, secret);

  return {
    token,
    player: gamePlayer.player,
    gameId: gamePlayer.gameId,
  };
};

export const extrractGamePlayerFromValidToken = async (
  token: string,
  secret: string
): Promise<GamePlayer> => {
  const isValid = await jwt.verify(token, secret);

  if (!isValid) {
    throw new Error(ErrorTypes.FORBIDDEN);
  }

  const decoded = jwt.decode(token);
  const payload = decoded.payload as GamePlayer;

  if (!payload.gameId || !payload.player) {
    throw new Error(ErrorTypes.UNEXPECTED_ERROR);
  }

  return payload;
};

export const tokenForLoginId = async (
  loginId: string,
  secret: string,
  env: Env
): Promise<TokenResponse> => {
  const gamePlayer = await loadGamePlayerByLoginId(loginId, env);
  return generateTokenForPlayer(gamePlayer, secret);
};
