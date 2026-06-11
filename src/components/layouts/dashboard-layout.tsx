import { Helmet } from '@dr.pogodin/react-helmet';
import { useLocation } from 'react-router';
import { ReactNode, useEffect, useState } from 'react';

import AppTopBar from '@/components/layouts/app-topbar.tsx';
import { AppBottomTabs } from '@/components/layouts/app-bottom-tabs.tsx';
import { AppCommandPalette } from '@/components/layouts/app-command-palette.tsx';
import { AppStartACaseButton } from '@/components/layouts/app-start-a-case-button.tsx';
import { AmberFAB } from '@/components/signature/amber-fab.tsx';
import { GrainOverlay } from '@/components/foundation/grain-overlay.tsx';
import { SkipToContent } from '@/components/foundation/skip-to-content.tsx';
import { useStreak } from '@/features/cases/hooks/use-streak.ts';
import { paths } from '@/config/paths.ts';
import { cn } from '@/lib/utils.ts';

/**
 * Routes where the mobile AmberFAB is HIDDEN.
 *
 * Per spec section 10: the FAB is the mobile equivalent of the desktop
 * "Start a case" button. It's a redundant CTA when the user is already on a
 * surface whose primary purpose IS starting/doing a case (Practice flows).
 * It earns its place on Library / Progress where there's no inline start CTA.
 */
const FAB_HIDDEN_PATH_PREFIXES = [
  '/app/cases/random',
  '/app/cases/drill',
  // Per-case routes (/app/cases/:id/attempt|review) — match by suffix below.
];

const shouldHideFab = (pathname: string) => {
  if (FAB_HIDDEN_PATH_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // /app/cases/<id>/attempt|review
  if (
    /^\/app\/cases\/[^/]+\/(attempt|review)$/.test(pathname) &&
    pathname !== paths.app.cases.getHref()
  ) {
    return true;
  }
  return false;
};

/**
 * AppShell — wraps every authenticated app route.
 *
 * - Pinned to `.light` so the app is light-first regardless of system theme
 *   (per spec section 2). The user can still flip via the theme switch in
 *   the avatar menu; the next-themes value propagates to the landing.
 * - Hosts the command palette globally (⌘K from anywhere).
 * - Coordinates StartACase open-state across the top-bar CTA, the mobile
 *   FAB, and the command palette's "Start a case" item.
 */
export function DashboardLayout({ children }: { children: ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [startACaseOpen, setStartACaseOpen] = useState(false);
  const { pathname } = useLocation();
  const streak = useStreak();

  /**
   * Pin `.light` on <body> while inside the app shell so Radix portals
   * (Popover, Dialog, DropdownMenu) — which render at document.body — inherit
   * the light tokens. The `.light` class on this div alone doesn't reach
   * portaled content. Counterpart to PublicLayout's `.dark` pin.
   */
  useEffect(() => {
    document.body.classList.add('light');
    return () => document.body.classList.remove('light');
  }, []);

  return (
    <div
      className={cn(
        'light bg-background text-foreground relative isolate flex min-h-dvh w-full flex-col',
      )}
    >
      <Helmet title="Pigmemento" />
      <SkipToContent />
      {/* Paper-warm grain — 1% opacity, free, the secret-sauce material texture */}
      <GrainOverlay intensity={0.9} />

      <AppTopBar
        onOpenCommandPalette={() => setCommandOpen(true)}
        streak={streak}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-6 focus:outline-none sm:px-6 md:py-10"
      >
        {children}
      </main>

      <AppBottomTabs />

      {/* Mobile FAB — fixed position, hidden when redundant */}
      {!shouldHideFab(pathname) && (
        <AmberFAB
          aria-label="Start a case"
          onClick={() => setStartACaseOpen(true)}
        />
      )}

      {/* The picker is controlled-only (withTrigger={false}) so it's shared
          between the top-bar amber CTA, the mobile FAB, and the command
          palette's "Start a case" item. */}
      <AppStartACaseButton
        open={startACaseOpen}
        onOpenChange={setStartACaseOpen}
        withTrigger={false}
      />

      <AppCommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onStartACase={() => setStartACaseOpen(true)}
      />
    </div>
  );
}
