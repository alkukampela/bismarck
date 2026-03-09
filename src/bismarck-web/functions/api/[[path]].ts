interface Env {
  BISMARCK_SERVER: Fetcher;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  // Forward all /api/* requests to the bound Worker
  return context.env.BISMARCK_SERVER.fetch(context.request);
};
