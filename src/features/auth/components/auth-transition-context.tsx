import { createContext, useContext } from 'react';

/**
 * Bridge between the auth forms and the AuthLayout's fade-through animation.
 *
 * The forms call `fadeToLight(destination)` when their mutation succeeds.
 * The layout owns the animation timing and the actual `navigate` call,
 * so the fade-through finishes BEFORE the route swap. This makes the
 * dark→light transition feel like a deliberate moment rather than an
 * abrupt route change.
 */
export type AuthTransitionContextValue = {
  fadeToLight: (destination: string) => void;
};

export const AuthTransitionContext = createContext<AuthTransitionContextValue>({
  fadeToLight: () => {
    // No-op default — outside of AuthLayout, the form falls back to whatever
    // the consumer wants. (Currently only the auth screens host the context.)
  },
});

export const useAuthTransition = () => useContext(AuthTransitionContext);
