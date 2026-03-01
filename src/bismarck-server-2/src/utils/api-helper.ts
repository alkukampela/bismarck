import { StatusCodes } from 'http-status-codes';

export const handleError = (
  err: unknown,
  statusCode: number = StatusCodes.BAD_REQUEST
): Response => {
  if (err instanceof Error) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const jsonResponse = (data: unknown, status = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};
