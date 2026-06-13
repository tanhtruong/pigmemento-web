import { Link, useLocation } from 'react-router';

import { paths } from '@/config/paths.ts';
import { cn } from '@/lib/utils.ts';
import { AppAvatarMenu } from '@/components/layouts/app-avatar-menu.tsx';

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

/**
 * The app's primary chrome — one quiet strip (#66).
 *
 *   Desktop (≥ md): logo · Practice · Library · Progress · Profile … avatar
 *   Mobile  (< md): logo … avatar     (nav lives in AppBottomTabs)
 *
 * Stripped to wayfinding + identity: no amber CTA, no streak chip, no ⌘K
 * button. Starting a case is the Practice surface (desktop) / the AmberFAB
 * (mobile); ⌘K still opens the command palette from the keyboard, handled
 * globally in AppCommandPalette. The logo and nav sit together, left-anchored,
 * and the current surface is marked by a quiet amber underline rather than a
 * filled pill.
 */
const AppTopBar = () => {
  const { pathname } = useLocation();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        'border-b border-hairline bg-background/85 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left — logo + nav, anchored together */}
        <div className="flex items-center gap-6 lg:gap-8">
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
            className="hidden items-center gap-1 md:flex"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActiveNav(pathname, item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex items-center px-2 py-1.5 text-sm',
                    'transition-colors ease-considered duration-150',
                    active
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.label}
                  {active && (
                    <span
                      aria-hidden
                      className="bg-primary absolute inset-x-2 bottom-0 h-0.5 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right — identity only */}
        <AppAvatarMenu />
      </div>
    </header>
  );
};

export default AppTopBar;
