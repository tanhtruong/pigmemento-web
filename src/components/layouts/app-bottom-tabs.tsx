import { NavLink, useLocation } from 'react-router';
import { GraduationCap, LayoutDashboard, Library, User2 } from 'lucide-react';

import { paths } from '@/config/paths.ts';
import { cn } from '@/lib/utils.ts';

type Tab = {
  to: string;
  label: string;
  Icon: typeof Library;
  /** Marks the tab as "active" for any sub-route prefix. */
  matchPrefixes: string[];
};

const TABS: Tab[] = [
  {
    to: paths.app['case-random'].getHref(),
    label: 'Practice',
    Icon: GraduationCap,
    matchPrefixes: [
      paths.app['case-random'].getHref(),
      '/app/cases/random',
      '/app/cases/drill',
    ],
  },
  {
    to: paths.app.cases.getHref(),
    label: 'Library',
    Icon: Library,
    matchPrefixes: [paths.app.cases.getHref()],
  },
  {
    to: paths.app.dashboard.getHref(),
    label: 'Progress',
    Icon: LayoutDashboard,
    matchPrefixes: [paths.app.dashboard.getHref()],
  },
  {
    to: paths.app.profile.getHref(),
    label: 'Profile',
    Icon: User2,
    matchPrefixes: [paths.app.profile.getHref()],
  },
];

const isActiveTab = (currentPath: string, tab: Tab) => {
  if (currentPath === tab.to) return true;
  return tab.matchPrefixes.some((p) => currentPath.startsWith(p));
};

/**
 * Mobile bottom tabs — 4 surfaces (Practice · Library · Progress · Profile).
 *
 * Sticks to the bottom with safe-area inset. Active tab carries a small
 * amber dot above the icon — quieter than a filled pill, more "Things-iOS"
 * than "browser tab".
 *
 * Hidden ≥ md (desktop uses the top-bar nav instead).
 */
export const AppBottomTabs = () => {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'sticky bottom-0 z-30 md:hidden',
        'border-t border-hairline bg-background/90 backdrop-blur-md',
        'pb-[env(safe-area-inset-bottom,0)]',
      )}
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = isActiveTab(pathname, tab);
          const Icon = tab.Icon;
          return (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={false}
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
                />
                <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
                <span className="text-[0.65rem] leading-tight font-medium">
                  {tab.label}
                </span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
