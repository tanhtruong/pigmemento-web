import { useLocation } from 'react-router';
import { GraduationCap, LayoutDashboard, Library, User2 } from 'lucide-react';

import { paths } from '@/config/paths.ts';
import { cn } from '@/lib/utils.ts';
import { AppTabLink } from '@/components/layouts/app-tab-link.tsx';

type Tab = {
  to: string;
  label: string;
  Icon: typeof Library;
  /** Marks the tab as "active" for any sub-route prefix. */
  matchPrefixes: string[];
};

const TABS: Tab[] = [
  {
    to: paths.app.dashboard.getHref(),
    label: 'Dashboard',
    Icon: LayoutDashboard,
    matchPrefixes: [paths.app.dashboard.getHref()],
  },
  {
    to: paths.app.cases.getHref(),
    label: 'Library',
    Icon: Library,
    matchPrefixes: [paths.app.cases.getHref()],
  },
  {
    to: paths.app['case-random'].getHref(),
    label: 'Practice',
    Icon: GraduationCap,
    matchPrefixes: ['/app/cases/random', '/app/cases/drill'],
  },
  {
    to: paths.app.profile.getHref(),
    label: 'Profile',
    Icon: User2,
    matchPrefixes: [paths.app.profile.getHref()],
  },
];

/**
 * Longest-prefix-wins active resolver — see AppTopBar for the rationale. A
 * naive per-tab `startsWith` lights up Library alongside Practice on
 * `/app/cases/random/attempt` because `/app/cases` is an ancestor prefix; the
 * most-specific match wins instead.
 */
const activeTab = (currentPath: string, tabs: Tab[]): Tab | null => {
  let best: Tab | null = null;
  let bestLength = -1;
  for (const tab of tabs) {
    for (const prefix of tab.matchPrefixes) {
      const matches =
        currentPath === prefix || currentPath.startsWith(`${prefix}/`);
      if (matches && prefix.length > bestLength) {
        bestLength = prefix.length;
        best = tab;
      }
    }
  }
  return best;
};

/**
 * Mobile bottom tabs — 4 surfaces (Dashboard · Library · Practice · Profile).
 *
 * Sticks to the bottom with safe-area inset. Active tab carries a small
 * amber dot above the icon — quieter than a filled pill, more "Things-iOS"
 * than "browser tab".
 *
 * Hidden ≥ md (desktop uses the top-bar nav instead).
 */
export const AppBottomTabs = () => {
  const { pathname } = useLocation();
  const current = activeTab(pathname, TABS);

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'sticky bottom-0 z-30 md:hidden',
        'border-t border-hairline bg-background/90 backdrop-blur-md',
        'pb-[env(safe-area-inset-bottom,0)]',
        // Pinned out of the View Transition root so the bar never slides or
        // double-renders its blur during an in-app hop (#102).
        '[view-transition-name:app-tabs]',
      )}
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = tab === current;
          const Icon = tab.Icon;
          return (
            <li key={tab.to}>
              <AppTabLink
                to={tab.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group/tab flex flex-col items-center gap-0.5 px-2 pt-2 pb-1.5',
                  'transition-colors ease-considered duration-150',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'mb-0.5 h-1 w-1 rounded-full transition-all',
                    active ? 'bg-primary' : 'bg-transparent',
                  )}
                  // Only the active dot is named, so exactly one `tab-indicator`
                  // exists per snapshot (no duplicate-name abort); the View
                  // Transition then slides it between tabs (#104).
                  style={
                    active ? { viewTransitionName: 'tab-indicator' } : undefined
                  }
                />
                <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
                <span className="text-[0.65rem] leading-tight font-medium">
                  {tab.label}
                </span>
              </AppTabLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
