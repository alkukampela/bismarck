import { DurableObject } from 'cloudflare:workers';
import { AutoRouter } from 'itty-router';
import { getCurrentTrick, getStatute } from './domain/hand-service';
import { StatusCodes } from 'http-status-codes';
import { tokenForLoginId } from './service/token-service';
import { FetchTokenRequest } from './types/fetch-token-request';
import {
  getTypedContent,
  withCreateGameRequest,
  withFetchTokenRequest,
} from './validation/type-guard-middleware';
import { createGameAndInvitatePlayers } from './domain/game-creation-service';
import { CreateGameRequest } from '../../types/create-game-request';

/**
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */
export { GameStorage } from './persistence/game-storage';
export class MyDurableObject extends DurableObject<Env> {
  /**
   * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
   * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
   *
   * @param ctx - The interface for interacting with Durable Object state
   * @param env - The interface to reference bindings declared in wrangler.jsonc
   */
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  /**
   * The Durable Object exposes an RPC method sayHello which will be invoked when a Durable
   *  Object instance receives a request from a Worker via the same method invocation on the stub
   *
   * @param name - The name provided to a Durable Object instance from a Worker
   * @returns The greeting to be sent back to the Worker
   */
  async sayHello(name: string): Promise<string> {
    return `Hello, ${name}!`;
  }
}

const handleError = (
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

const jsonResponse = (data: unknown, status = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

const router = AutoRouter({ base: '/api' });


router
  .get('/hello', async (env: Env) => {
    // Create a stub to open a communication channel with the Durable Object
    // instance named "foo".
    //
    // Requests from all Workers to the Durable Object instance named "foo"
    // will go to a single remote Durable Object instance.
    const stub = env.MY_DURABLE_OBJECT.getByName('foo');

    // Call the `sayHello()` RPC method on the stub to invoke the method on
    // the remote Durable Object instance.
    const greeting = await stub.sayHello('world');

    return new Response(greeting);
  })
  .get('/games/:id/hand/statute', async (request, env: Env) => {
    const gameId = request.params.id;
    try {
      const statute = await getStatute(gameId, env);
      return jsonResponse(statute);
    } catch (err: unknown) {
      return handleError(err);
    }
  })
  .post(
    '/games/:id/hand/statute',
    () => new Response('Not implemented', { status: 501 })
  )
  .get(
    '/games/:id/hand/cards',
    () => new Response('Not implemented', { status: 501 })
  )
  .delete(
    '/games/:id/hand/cards',
    () => new Response('Not implemented', { status: 501 })
  )
  .get('/games/:id/hand/trick', async (request) => {
    const gameId = request.params.id;
    const trick = await getCurrentTrick(gameId);
    return jsonResponse(trick);
  })
  .post(
    '/games/:id/hand/trick',
    () => new Response('Not implemented', { status: 501 })
  )
  .post(
    '/games/:id/hand/trick/cards',
    () => new Response('Not implemented', { status: 501 })
  )
  .get(
    '/games/:id/hand/trick-count',
    () => new Response('Not implemented', { status: 501 })
  )
  .get(
    '/games/:id/hand/tablecards',
    () => new Response('Not implemented', { status: 501 })
  )
  .get(
    '/games/:id/score',
    () => new Response('Not implemented', { status: 501 })
  )
  .post('/games', withCreateGameRequest, async (request, env: Env) => {
    try {
      const createGameRequest = getTypedContent<CreateGameRequest>(request);
      const creatGameResponse = await createGameAndInvitatePlayers(
        createGameRequest,
        env
      );
      return jsonResponse(creatGameResponse, StatusCodes.CREATED);
    } catch (err: unknown) {
      return handleError(err, StatusCodes.FORBIDDEN);
    }
  })
  .post(
    '/games/:id/hand',
    () => new Response('Not implemented', { status: 501 })
  )
  .post('/fetch-token', withFetchTokenRequest, async (request, env: Env) => {
    const content = getTypedContent<FetchTokenRequest>(request);
    try {
      const result = await tokenForLoginId(content.loginId, env);
      return jsonResponse(result);
    } catch (err: unknown) {
      return handleError(err, StatusCodes.FORBIDDEN);
    }
  })
  .get('/dev/:id', () => new Response('Not implemented', { status: 501 }))
  .post('/dev/:id', () => new Response('Not implemented', { status: 501 }));

export default { ...router } satisfies ExportedHandler<Env>;
