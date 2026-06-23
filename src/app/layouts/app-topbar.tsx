import { Link, useLocation } from 'react-router';

import { paths } from '@/config/paths.ts';
import { cn } from '@/utils/cn.ts';
import { AppAvatarMenu } from '@/app/layouts/app-avatar-menu.tsx';
import { AppTabLink } from '@/components/layouts/app-tab-link.tsx';

type NavItem = {
  to: string;
  label: string;
  matchPrefixes: string[];
};

const NAV_ITEMS: NavItem[] = [
  {
    to: paths.app.dashboard.getHref(),
    label: 'Dashboard',
    matchPrefixes: [paths.app.dashboard.getHref()],
  },
  {
    to: paths.app.cases.getHref(),
    label: 'Library',
    matchPrefixes: [paths.app.cases.getHref()],
  },
  {
    to: paths.app['case-random'].getHref(),
    label: 'Practice',
    matchPrefixes: ['/app/cases/random', '/app/cases/drill'],
  },
  {
    to: paths.app.profile.getHref(),
    label: 'Profile',
    matchPrefixes: [paths.app.profile.getHref()],
  },
];

/**
 * Longest-prefix-wins active resolver.
 *
 * A naive per-item `startsWith` lights up every ancestor: on
 * `/app/cases/random/attempt`, Library's `/app/cases` prefix matches alongside
 * Practice's `/app/cases/random`. We instead pick the single item whose matched
 * prefix is the most specific (longest), so only Practice wins there while a
 * bare `/app/cases/:id/attempt` still resolves to Library.
 */
const activeNavItem = (pathname: string, items: NavItem[]): NavItem | null => {
  let best: NavItem | null = null;
  let bestLength = -1;
  for (const item of items) {
    for (const prefix of item.matchPrefixes) {
      const matches = pathname === prefix || pathname.startsWith(`${prefix}/`);
      if (matches && prefix.length > bestLength) {
        bestLength = prefix.length;
        best = item;
      }
    }
  }
  return best;
};

/**
 * The app's primary chrome — one quiet strip (#66).
 *
 *   Desktop (≥ md): logo · Dashboard · Library · Practice · Profile … avatar
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
  const active = activeNavItem(pathname, NAV_ITEMS);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        'border-b border-hairline bg-background/85 backdrop-blur-md',
        // Pinned out of the View Transition root so the strip never slides or
        // double-renders its blur during an in-app hop (#102).
        '[view-transition-name:app-topbar]',
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left — logo + nav, anchored together */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            to={paths.app.dashboard.getHref()}
            className="flex items-center gap-2"
            aria-label="Pigmemento — go to Dashboard"
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
              const isActive = item === active;
              return (
                <AppTabLink
                  key={item.to}
                  to={item.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex items-center px-2 py-1.5 text-sm',
                    'transition-colors ease-considered duration-150',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.label}
                  {isActive && (
                    // The active underline is a relocating singleton: rendered
                    // only on the current tab and named so the View Transition
                    // morphs it from the old tab's box to the new one — it
                    // glides between tabs instead of snapping (#104).
                    <span
                      aria-hidden
                      className="bg-primary absolute inset-x-2 bottom-0 h-0.5 rounded-full"
                      style={{ viewTransitionName: 'tab-indicator' }}
                    />
                  )}
                </AppTabLink>
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
