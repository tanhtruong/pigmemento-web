import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/** MSW worker for the browser — started from main.tsx behind ENABLE_API_MOCKING. */
export const worker = setupWorker(...handlers);
