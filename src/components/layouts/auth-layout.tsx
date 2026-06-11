import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'motion/react';

import { paths } from '@/config/paths';
import { Head } from '../seo/head';
import { isTokenValid } from '@/lib/auth';
import { GrainOverlay } from '@/components/foundation/grain-overlay';
import { AmberGlow } from '@/components/foundation/amber-glow';
import { motionDurations } from '@/lib/motion-tokens';
import { AuthTransitionContext } from '@/features/auth/components/auth-transition-context';

type LayoutProps = {
  children: React.ReactNode;
  /** Instrument Serif headline at the top of the panel — sentence case. */
  title: string;
  /** Geist Sans subhead under the title. */
  subtitle?: string;
};

/** Dark-out duration before the actual navigation fires. */
const FADE_THROUGH_MS = 600;

/**
 * Auth shell — dark single-column centered, the bridge between landing and
 * app. Per spec § 13a: continuation of the landing voice; successful sign-in
 * fades through to the light app — a deliberate moment.
 *
 * The fade-through is driven by the `AuthTransitionContext`. When a form
 * mutation succeeds, it calls `fadeToLight(destination)` — the layout
 * mounts a full-screen bone-warm overlay that fades in over FADE_THROUGH_MS,
 * then calls `navigate(destination, { replace: true })`. The next route
 * (the app shell) mounts already light, so the user perceives a single
 * continuous dark → light transition.
 *
 * `.dark` is pinned on both the wrapper and <body> so Radix portals
 * (Toaster, any future dialogs) inherit the dark tokens.
 */
export const AuthLayout = ({ children, title, subtitle }: LayoutProps) => {
  const isLoggedIn = isTokenValid();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();

  const [fade, setFade] = useState<{ destination: string } | null>(null);

  // Already-authenticated visitors get bounced immediately (no animation).
  useEffect(() => {
    if (isLoggedIn) {
      navigate(redirectTo ? redirectTo : paths.app.dashboard.getHref(), {
        replace: true,
      });
    }
  }, [isLoggedIn, navigate, redirectTo]);

  // Dark surface — pin both wrapper and body so portals inherit.
  useEffect(() => {
    document.body.classList.add('dark');
    return () => document.body.classList.remove('dark');
  }, []);

  // Drive the fade-through navigation.
  useEffect(() => {
    if (!fade) return;
    const delay = reducedMotion ? 0 : FADE_THROUGH_MS;
    const t = window.setTimeout(() => {
      navigate(fade.destination, { replace: true });
    }, delay);
    return () => window.clearTimeout(t);
  }, [fade, navigate, reducedMotion]);

  const fadeToLight = useCallback((destination: string) => {
    setFade({ destination });
  }, []);

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0 : motionDurations.considered,
        ease: [0.2, 0.8, 0.2, 1],
      },
    },
  };

  return (
    <AuthTransitionContext.Provider value={{ fadeToLight }}>
      <div className="dark bg-background text-foreground relative isolate flex min-h-screen flex-col">
        <Head title={`${title} — Pigmemento`} />
        <GrainOverlay intensity={1.4} />

        <AmberGlow
          size="xl"
          variant="full"
          className="left-1/2 top-1/3 -z-10 -translate-x-1/2 -translate-y-1/2 opacity-50"
        />

        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex w-full max-w-[22rem] flex-col gap-8"
          >
            <a
              href={paths.home.path}
              aria-label="Pigmemento — back to landing"
              className="text-foreground mx-auto flex items-center gap-2"
            >
              <span className="bg-primary text-primary-foreground rounded-input font-display inline-flex h-8 w-8 items-center justify-center text-base">
                P
              </span>
              <span className="text-sm font-medium tracking-tight">
                Pigmemento
              </span>
            </a>

            <div className="flex flex-col gap-2 text-center">
              <h1 className="font-display text-4xl leading-tight">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground text-sm">{subtitle}</p>
              )}
            </div>

            <div className="border-hairline shadow-cinematic surface-card-dark bg-card/95 rounded-card border p-6">
              {children}
            </div>

            <div className="text-muted-foreground flex flex-col gap-1 text-center text-xs">
              <p className="font-mono tracking-wider uppercase">
                Pattern recognition, case by case.
              </p>
              <p>Educational use only — not for diagnosis.</p>
            </div>
          </motion.div>
        </main>

        {/* Fade-through overlay — bone-warm light, slides in over the dark
            surface, then the route swap mounts the app shell underneath. */}
        <AnimatePresence>
          {fade && (
            <motion.div
              key="auth-fade-through"
              aria-hidden
              className="fixed inset-0 z-[60]"
              style={{ backgroundColor: 'oklch(0.97 0.008 80)' /* paper */ }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              transition={{
                duration: reducedMotion ? 0 : FADE_THROUGH_MS / 1000,
                ease: [0.2, 0.8, 0.2, 1],
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </AuthTransitionContext.Provider>
  );
};
