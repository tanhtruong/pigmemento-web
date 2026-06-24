/**
 * Shared mock surface. Only the handlers are re-exported here; import the
 * environment-specific entrypoints directly — `./server` (msw/node) from tests,
 * `./browser` (msw/browser) from the app — so neither runtime pulls the other.
 */
export { handlers } from './handlers';
