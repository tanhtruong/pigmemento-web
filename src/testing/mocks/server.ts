import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/** MSW server for the vitest (node / jsdom) environment — wired in setup.ts. */
export const server = setupServer(...handlers);
