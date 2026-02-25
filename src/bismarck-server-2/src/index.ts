import { DurableObject } from "cloudflare:workers";

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/** A Durable Object's behavior is defined in an exported Javascript class */
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

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

    if (url.pathname === "/api/hello") {
      // Create a stub to open a communication channel with the Durable Object
      // instance named "foo".
      //
      // Requests from all Workers to the Durable Object instance named "foo"
      // will go to a single remote Durable Object instance.
      const stub = env.MY_DURABLE_OBJECT.getByName("foo");

      // Call the `sayHello()` RPC method on the stub to invoke the method on
      // the remote Durable Object instance.
      const greeting = await stub.sayHello("world");

      return new Response(greeting);
    }

		// GET /games/:id/hand/statute
		if (/^\/games\/[^\/]+\/hand\/statute$/.test(url.pathname) && request.method === 'GET') {
			const gameId = extractGameIdFromPath(url.pathname);
      return new Response('Not implemented', { status: 501 });
		}
		// POST /games/:id/hand/statute
		if (/^\/games\/[^\/]+\/hand\/statute$/.test(url.pathname) && request.method === 'POST') {
			const gameId = extractGameIdFromPath(url.pathname);
			return new Response('Not implemented', { status: 501 });
		}
		// GET /games/:id/hand/cards
		if (/^\/games\/[^\/]+\/hand\/cards$/.test(url.pathname) && request.method === 'GET') {
			const gameId = extractGameIdFromPath(url.pathname);
      return new Response('Not implemented', { status: 501 });
		}
		// DELETE /games/:id/hand/cards
		if (/^\/games\/[^\/]+\/hand\/cards$/.test(url.pathname) && request.method === 'DELETE') {
			const gameId = extractGameIdFromPath(url.pathname);
			return new Response('Not implemented', { status: 501 });
		}
		// GET /games/:id/hand/trick
		if (/^\/games\/[^\/]+\/hand\/trick$/.test(url.pathname) && request.method === 'GET') {
			const gameId = extractGameIdFromPath(url.pathname);
			return new Response('Not implemented', { status: 501 });
		}
		// POST /games/:id/hand/trick
		if (/^\/games\/[^\/]+\/hand\/trick$/.test(url.pathname) && request.method === 'POST') {
			const gameId = extractGameIdFromPath(url.pathname);
			return new Response('Not implemented', { status: 501 });
		}
		// POST /games/:id/hand/trick/cards
		if (/^\/games\/[^\/]+\/hand\/trick\/cards$/.test(url.pathname) && request.method === 'POST') {
			const gameId = extractGameIdFromPath(url.pathname);
			return new Response('Not implemented', { status: 501 });
		}
		// GET /games/:id/hand/trick-count
		if (/^\/games\/[^\/]+\/hand\/trick-count$/.test(url.pathname) && request.method === 'GET') {
			return new Response('Not implemented', { status: 501 });
		}
		// GET /games/:id/hand/tablecards
		if (/^\/games\/[^\/]+\/hand\/tablecards$/.test(url.pathname) && request.method === 'GET') {
			const gameId = extractGameIdFromPath(url.pathname);
			return new Response('Not implemented', { status: 501 });
		}
		// GET /games/:id/score
		if (/^\/games\/[^\/]+\/score$/.test(url.pathname) && request.method === 'GET') {
			const gameId = extractGameIdFromPath(url.pathname);
			return new Response('Not implemented', { status: 501 });
		}
		// POST /games
		if (/^\/games$/.test(url.pathname) && request.method === 'POST') {
			return new Response('Not implemented', { status: 501 });
		}
		// POST /games/:id/hand
		if (/^\/games\/[^\/]+\/hand$/.test(url.pathname) && request.method === 'POST') {
			const gameId = extractGameIdFromPath(url.pathname);
			return new Response('Not implemented', { status: 501 });
		}
		// POST /fetch-token
		if (/^\/fetch-token$/.test(url.pathname) && request.method === 'POST') {
			return new Response('Not implemented', { status: 501 });
		}
		// GET /dev/:id
		if (/^\/dev\/[^\/]+$/.test(url.pathname) && request.method === 'GET') {
			return new Response('Not implemented', { status: 501 });
		}
		// POST /dev/:id
		if (/^\/dev\/[^\/]+$/.test(url.pathname) && request.method === 'POST') {
			return new Response('Not implemented', { status: 501 });
		}
		// Default
		return new Response("Not found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;

const extractGameIdFromPath = (path: string): string => {
  const match = path.match(/^\/games\/([^\/]+)/);
  if (!match) {
    throw new Error(`Invalid path: ${path}`);
  }
  return match[1];
}
