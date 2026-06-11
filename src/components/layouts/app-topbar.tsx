import { Link, NavLink, useLocation } from 'react-router';
import { Command } from 'lucide-react';

import { paths } from '@/config/paths.ts';
import { cn } from '@/lib/utils.ts';
import { StreakChip } from '@/components/signature/streak-chip.tsx';
import { AppAvatarMenu } from '@/components/layouts/app-avatar-menu.tsx';
import { AppStartACaseButton } from '@/components/layouts/app-start-a-case-button.tsx';

type NavItem = {
  to: string;
  label: string;
  matchPrefixes: string[];
};

const NAV_ITEMS: NavItem[] = [
  {
    to: paths.app['case-random'].getHref(),
    label: 'Practice',
    matchPrefixes: ['/app/cases/random', '/app/cases/drill'],
  },
  {
    to: paths.app.cases.getHref(),
    label: 'Library',
    matchPrefixes: [paths.app.cases.getHref()],
  },
  {
    to: paths.app.dashboard.getHref(),
    label: 'Progress',
    matchPrefixes: [paths.app.dashboard.getHref()],
  },
  {
    to: paths.app.profile.getHref(),
    label: 'Profile',
    matchPrefixes: [paths.app.profile.getHref()],
  },
];

const isActiveNav = (pathname: string, item: NavItem) => {
  if (pathname === item.to) return true;
  return item.matchPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
};

type AppTopBarProps = {
  /** Opens the ⌘K command palette. Wired by AppShell. */
  onOpenCommandPalette: () => void;
  /** Streak value to render in the chip. Placeholder until PR9 ships the
   *  real streak source — for PR3 the shell passes a hardcoded `0`. */
  streak?: number;
};

/**
 * The app's primary chrome — single top bar that adapts:
 *
 *   Desktop (≥ md): logo · 4 nav items · ⌘K · streak chip · amber CTA · avatar
 *   Mobile  (< md): logo · ⌘K · avatar     (nav lives in AppBottomTabs)
 *
 * Per spec section 10: minimal, never eats the horizontal canvas the
 * lesion imagery needs.
 */
const AppTopBar = ({ onOpenCommandPalette, streak = 0 }: AppTopBarProps) => {
  const { pathname } = useLocation();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        'border-b border-hairline bg-background/85 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo — always visible */}
        <Link
          to={paths.app.dashboard.getHref()}
          className="flex items-center gap-2"
          aria-label="Pigmemento — go to Progress"
        >
          <span
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-input',
              'bg-primary text-primary-foreground font-display text-base',
            )}
            aria-hidden
          >
            P
          </span>
          <span className="text-foreground hidden text-sm font-medium tracking-tight sm:inline">
            Pigmemento
          </span>
        </Link>

        {/* Desktop nav — 4 surfaces. Mobile uses AppBottomTabs. */}
        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center justify-center gap-1 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActiveNav(pathname, item);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={false}
                className={cn(
                  'rounded-input px-3 py-1.5 text-sm transition-colors ease-considered duration-150',
                  active
                    ? 'text-foreground bg-accent font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                )}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Utility cluster */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* ⌘K command palette trigger — visible on all sizes */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Open command palette"
            className={cn(
              'border-hairline text-muted-foreground hover:text-foreground hover:bg-accent',
              'inline-flex items-center gap-1.5 rounded-input border px-2.5 py-1.5',
              'transition-colors ease-considered duration-150',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none',
            )}
          >
            <Command className="h-3.5 w-3.5" />
            <span className="hidden font-mono text-[0.7rem] tracking-wider uppercase sm:inline">
              K
            </span>
          </button>

          {/* Streak chip — desktop only (mobile keeps the bar slim) */}
          {streak > 0 && (
            <span className="hidden md:inline-flex">
              <StreakChip value={streak} />
            </span>
          )}

          {/* Amber CTA — desktop only. Mobile uses the AmberFAB. */}
          <span className="hidden md:inline-flex">
            <AppStartACaseButton />
          </span>

          <AppAvatarMenu />
        </div>
      </div>
    </header>
  );
};

export default AppTopBar;
