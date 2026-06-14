/**
 * In-app route hops ride the browser's View Transitions API (#102). Where it's
 * missing — older Safari / Firefox point versions — every hop degrades to an
 * instant cut and nothing else changes. Feature-detected, never UA-sniffed.
 */
export const supportsViewTransitions = (): boolean =>
  typeof document !== 'undefined' && 'startViewTransition' in document;
