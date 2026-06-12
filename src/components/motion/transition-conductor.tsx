import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from 'motion/react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import {
  BLOOM_SOLID_CORE,
  bloomGeometry,
  conductorTimings,
  initialConductorState,
  reduceConductor,
  shouldFireNavigate,
  type TransitionRequest,
} from '@/lib/transition-conductor';
import { GrainOverlay } from '@/components/foundation/grain-overlay';

/**
 * TransitionConductor — the single narrator of every hop across the
 * landing/auth/app boundary (#43).
 *
 * Mounted as a pathless root layout route so it persists across all route
 * swaps and can drive `navigate()`. The pure state machine lives in
 * `lib/transition-conductor.ts`; this layer owns timers, the location
 * subscription, and the overlay rendering.
 *
 * The gesture — "the darkroom lamp": an amber disc blooms from the user's
 * commit point (luminous heart at the click, feathered rim), covers the
 * viewport, and the route swap happens underneath it. For `enter-app` the
 * amber then warms into bone-warm paper — the print developing into
 * daylight — and lifts off the mounted app shell.
 *
 * Reduced motion runs the same machine with zero-length phases and skips
 * the overlay entirely: identical outcome, instant cut.
 */

type TransitionNavigate = (request: TransitionRequest) => void;

const TransitionConductorContext = createContext<TransitionNavigate | null>(
  null,
);

export const useTransitionNavigate = (): TransitionNavigate => {
  const start = useContext(TransitionConductorContext);
  if (!start) {
    throw new Error(
      'useTransitionNavigate must be used inside the TransitionConductor route shell',
    );
  }
  return start;
};

/** The house ease — cubic-bezier(0.2, 0.8, 0.2, 1), as a CSS string. */
const EASE_CSS = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

/** Paper — must match the light theme's resting `--background`. */
const SETTLE_PAPER = 'oklch(0.97 0.008 80)';

export const TransitionConductor = () => {
  const [state, dispatch] = useReducer(reduceConductor, initialConductorState);
  const reducedMotion = useReducedMotion() ?? false;
  const timings = conductorTimings(reducedMotion);
  const navigate = useNavigate();
  const location = useLocation();
  const prevStateRef = useRef(state);

  // Fire navigate exactly once, on the crossing into `holding`. The swap
  // happens under the fully-opaque overlay.
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;
    if (shouldFireNavigate(prev, state) && state.transition) {
      navigate(state.transition.destination, {
        replace: state.transition.kind === 'enter-app',
      });
    }
  }, [state, navigate]);

  // The router confirming the destination has mounted. While idle (every
  // ordinary navigation) the machine ignores this — tested.
  useEffect(() => {
    dispatch({ type: 'LOCATION_CHANGED' });
  }, [location.key]);

  // Phase timers. Generation guards make a stale timer harmless even if
  // cleanup loses the race.
  useEffect(() => {
    if (state.phase === 'blooming') {
      const t = window.setTimeout(
        () => dispatch({ type: 'APEX_REACHED', generation: state.generation }),
        timings.bloomMs,
      );
      return () => window.clearTimeout(t);
    }
    if (state.phase === 'dissolving') {
      const t = window.setTimeout(
        () => dispatch({ type: 'DISSOLVE_DONE', generation: state.generation }),
        timings.dissolveMs,
      );
      return () => window.clearTimeout(t);
    }
  }, [state.phase, state.generation, timings.bloomMs, timings.dissolveMs]);

  const startTransition = useCallback<TransitionNavigate>((request) => {
    dispatch({ type: 'START', request });
  }, []);

  const showOverlay = !reducedMotion && state.phase !== 'idle';

  return (
    <TransitionConductorContext.Provider value={startTransition}>
      <Outlet />
      {showOverlay &&
        state.transition &&
        createPortal(
          <ConductorOverlay
            key={state.generation}
            transition={state.transition}
            dissolving={state.phase === 'dissolving'}
            blooming={state.phase === 'blooming'}
            timings={timings}
          />,
          document.body,
        )}
    </TransitionConductorContext.Provider>
  );
};

type ConductorOverlayProps = {
  transition: TransitionRequest;
  blooming: boolean;
  dissolving: boolean;
  timings: ReturnType<typeof conductorTimings>;
};

/**
 * The overlay deliberately uses plain CSS transitions, not motion/react.
 * It is transition infrastructure — three compositor-driven property
 * changes on a portaled subtree that must never miss a frame while the
 * router swaps the tree underneath. Durations and easing still come from
 * the shared motion vocabulary.
 */
const ConductorOverlay = ({
  transition,
  blooming,
  dissolving,
  timings,
}: ConductorOverlayProps) => {
  // Two-frame arm: mount at scale(0), then flip to scale(1) on the next
  // frame so the CSS transition has a start state to animate from.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const disc = bloomGeometry(transition.origin, {
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const corePct = BLOOM_SOLID_CORE * 100;

  return (
    <div
      aria-hidden
      className="pointer-events-auto fixed inset-x-0 top-0 z-[70] overflow-hidden"
      style={{
        height: '100dvh',
        opacity: dissolving ? 0 : 1,
        transition: `opacity ${timings.dissolveMs}ms ${EASE_CSS}`,
      }}
    >
      {/* The bloom disc — luminous heart at the commit point, solid amber
          core sized to cover the farthest corner, feathered rim. */}
      <div
        className="absolute rounded-full"
        style={{
          width: disc.size,
          height: disc.size,
          left: disc.left,
          top: disc.top,
          backgroundImage: `radial-gradient(circle,
            oklch(from var(--primary) calc(l + 0.08) c h) 0%,
            var(--primary) 45%,
            var(--primary) ${corePct}%,
            transparent ${corePct + 8}%)`,
          transform: armed ? 'scale(1)' : 'scale(0)',
          transition: `transform ${timings.bloomMs}ms ${EASE_CSS}`,
        }}
      />

      {/* The settle wash — amber developing into bone-warm daylight once
          the bloom holds. Only `enter-app` resolves light (#43); the dark
          settles arrive with #44/#46. */}
      {transition.kind === 'enter-app' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: SETTLE_PAPER,
            opacity: blooming ? 0 : 1,
            transition: `opacity ${timings.dissolveMs}ms ${EASE_CSS}`,
          }}
        />
      )}

      {/* Film grain rides the transition so the surface never reads as
          flat digital color. */}
      <GrainOverlay scope="panel" intensity={1.2} seed={11} />
    </div>
  );
};
