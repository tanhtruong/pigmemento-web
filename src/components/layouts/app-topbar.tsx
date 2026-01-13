import { NavLink, useLocation } from 'react-router';
import { paths } from '@/config/paths';
import { Home, Library, Timer, EllipsisVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

import LogoutDialog from '@/features/auth/components/logout-dialog';
import { useProfile } from '@/features/profile/api/use-profile';
import { ComponentType, SVGProps } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar.tsx';
import { Badge } from '@/components/ui/badge.tsx';

type TopNavigationItem = {
  name: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
};

const AppTopBar = () => {
  const { data: user } = useProfile();
  const location = useLocation();

  const initials =
    (user?.name || user?.email || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U';

  const displayName = user?.name || 'Pigmemento User';

  const appNavigation: TopNavigationItem[] = [
    {
      name: 'Dashboard',
      to: paths.app.dashboard.getHref(),
      icon: Home,
      end: true,
    },
  ];

  const casesNavigation: TopNavigationItem[] = [
    {
      name: 'Case Library',
      to: paths.app.cases.getHref(),
      icon: Library,
      end: true,
    },
    {
      name: 'Drills',
      to: paths.app['case-drill'].getHref(),
      icon: Timer,
    },
  ];

  const allNavigation = [
    { label: 'Application', items: appNavigation },
    { label: 'Cases', items: casesNavigation },
  ];

  const isActivePath = (to: string, end?: boolean) => {
    if (end) return location.pathname === to;
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-3">
        <NavLink
          to={paths.app.dashboard.getHref()}
          className="flex items-center gap-2 min-w-0"
        >
          <img
            src="/android-chrome-512x512.png"
            alt="Pigmemento"
            className="h-7 w-auto"
          />
          <span className="text-sm font-semibold tracking-tight truncate">
            Pigmemento
          </span>
        </NavLink>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
              aria-label="Open menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src="" alt="profile image" />
                <AvatarFallback className="text-[10px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <EllipsisVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-72">
            <div className="px-2 py-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt="profile image" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {displayName}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {user?.role ?? 'user'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator />

            {allNavigation.map((group) => (
              <div key={group.label} className="py-1">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {group.label}
                </DropdownMenuLabel>

                {group.items.map((item) => {
                  const active = isActivePath(item.to, item.end);
                  const Icon = item.icon;

                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={cn(
                          'flex items-center gap-2',
                          active && 'bg-secondary text-primary',
                        )}
                      >
                        <Icon
                          strokeWidth={active ? 2.5 : 1}
                          className="h-4 w-4"
                        />
                        <span className={cn(active && 'font-bold')}>
                          {item.name}
                        </span>
                      </NavLink>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <NavLink to={paths.app.profile.getHref()}>Profile</NavLink>
            </DropdownMenuItem>

            <LogoutDialog>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Log out
              </DropdownMenuItem>
            </LogoutDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppTopBar;
