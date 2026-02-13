import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './mocks/server.js';

beforeAll(() => {
  server.listen({
    onUnhandledRequest: (request) => {
      throw new Error(
        `MSW: Unhandled ${request.method} ${request.url} request. Please add a request handler.`
      );
    },
  });
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});
