import { StatusCodes } from 'http-status-codes';
import { GameError } from './game-error';
import pino from 'pino';

const logger = pino();

export const handleError = (err: unknown): Response => {
  let status = StatusCodes.INTERNAL_SERVER_ERROR;
  let errorResponse: { error: string; errorCode?: string } = {
    error: 'Unexpected error',
  };

  if (err instanceof GameError) {
    status = err.getHttpStatusCode();
    errorResponse = {
      error: err.message,
      errorCode: err.errorCode,
    };

    // Log domain errors at appropriate level
    if (status >= 500) {
      logger.error({ err, errorCode: err.errorCode }, 'Server error');
    } else {
      logger.warn(
        { errorCode: err.errorCode, message: err.message },
        'Client error'
      );
    }
  } else if (err instanceof Error) {
    errorResponse = { error: err.message };
    logger.warn({ err }, 'Untyped error');
  } else {
    logger.error({ err }, 'Unknown error type');
  }

  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const jsonResponse = (data: unknown, status = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};
