import { Player } from '../../../types/player';
import { StatusCodes } from 'http-status-codes';
import { extrractGamePlayerFromValidToken } from '../service/token-service';

export interface AuthenticatedRequest extends Request {
  player: Player;
  validatedGameId: string;
  params: { id: string };
}

/**
 * Authenticate request and extract player data from JWT token
 * @returns Error Response if auth fails, or undefined if successful
 */
const authenticateRequest = async (
  request: Request,
  env: Env
): Promise<Response | undefined> => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', {
      status: StatusCodes.UNAUTHORIZED,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = await extrractGamePlayerFromValidToken(
      token,
      env.JWT_SECRET
    );

    const urlGameId = (request as AuthenticatedRequest).params.id;

    if (!urlGameId) {
      return new Response('Missing game ID in URL', {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    if (payload.gameId !== urlGameId) {
      return new Response('Token gameId does not match requested game', {
        status: StatusCodes.FORBIDDEN,
      });
    }

    const authReq = request as AuthenticatedRequest;
    authReq.player = payload.player;
    authReq.validatedGameId = payload.gameId;
  } catch (err) {
    return new Response('Token verification failed', {
      status: StatusCodes.FORBIDDEN,
    });
  }
};

const isAuthenticatedRequest = (
  request: Request
): request is AuthenticatedRequest => {
  return 'player' in request && 'validatedGameId' in request;
};

/**
 * Typed wrapper for authenticated route handlers
 */
export const authenticatedRoute = (
  handler: (request: AuthenticatedRequest, env: Env) => Promise<Response>
) => {
  return async (request: Request, env: Env): Promise<Response> => {
    const authFailure = await authenticateRequest(request, env);
    if (authFailure) {
      return authFailure;
    }

    if (isAuthenticatedRequest(request)) {
      return handler(request, env);
    }
    throw new Error('Authentication succeeded but request was not augmented');
  };
};
