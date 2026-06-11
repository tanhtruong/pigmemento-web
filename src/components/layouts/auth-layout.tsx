import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, useReducedMotion, type Variants } from 'motion/react';

import { paths } from '@/config/paths';
import { Head } from '../seo/head';
import { isTokenValid } from '@/lib/auth';
import { GrainOverlay } from '@/components/foundation/grain-overlay';
import { AmberGlow } from '@/components/foundation/amber-glow';
import { motionDurations } from '@/lib/motion-tokens';

type LayoutProps = {
  children: React.ReactNode;
  /** Instrument Serif headline at the top of the panel — sentence case. */
  title: string;
  /** Geist Sans subhead under the title. */
  subtitle?: string;
};

/**
 * Auth shell — dark single-column centered, the bridge between landing and
 * app. Per spec § 13a: continuation of the landing voice; successful sign-in
 * fades through to the light app — a deliberate moment.
 *
 * `.dark` is pinned on both the wrapper and <body> so Radix portals (Toaster,
 * any future dialogs) inherit the dark tokens (same pattern as PublicLayout).
 */
export const AuthLayout = ({ children, title, subtitle }: LayoutProps) => {
  const isLoggedIn = isTokenValid();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const reducedMotion = useReducedMotion();

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate(redirectTo ? redirectTo : paths.app.dashboard.getHref(), {
        replace: true,
      });
    }
  }, [isLoggedIn, navigate, redirectTo]);

  useEffect(() => {
    document.body.classList.add('dark');
    return () => document.body.classList.remove('dark');
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
    <div className="dark bg-background text-foreground relative isolate flex min-h-screen flex-col">
      <Head title={`${title} — Pigmemento`} />
      <GrainOverlay intensity={1.4} />

      {/* Cinematic backdrop — amber glow behind the panel */}
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
          {/* Brand mark — links back to landing */}
          <a
            href={paths.home.path}
            aria-label="Pigmemento — back to landing"
            className="mx-auto flex items-center gap-2 text-foreground"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-input bg-primary text-primary-foreground font-display text-base">
              P
            </span>
            <span className="text-sm font-medium tracking-tight">
              Pigmemento
            </span>
          </a>

          {/* Title block */}
          <div className="flex flex-col gap-2 text-center">
            <h1 className="font-display text-4xl leading-tight">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>

          {/* Form panel — bone-warm "preview" of the app card on top of dark */}
          <div className="border-hairline shadow-cinematic surface-card-dark rounded-card border bg-card/95 p-6">
            {children}
          </div>

          {/* Tagline + disclaimer — quiet, never shouty */}
          <div className="text-muted-foreground flex flex-col gap-1 text-center text-xs">
            <p className="font-mono tracking-wider uppercase">
              Pattern recognition, case by case.
            </p>
            <p>Educational use only — not for diagnosis.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
