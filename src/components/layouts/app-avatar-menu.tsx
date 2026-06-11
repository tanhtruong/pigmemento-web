import { Link } from 'react-router';
import { LogOut, User2 } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Hairline } from '@/components/foundation/hairline.tsx';
import { ThemeSwitch } from '@/components/layouts/theme-switch.tsx';
import { useProfile } from '@/features/profile/api/use-profile.ts';
import { useLogout } from '@/features/auth/hooks/use-auth.tsx';
import { paths } from '@/config/paths.ts';
import { cn } from '@/lib/utils.ts';

type AppAvatarMenuProps = {
  className?: string;
};

const initialsFrom = (name?: string, email?: string) =>
  (name || email || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'U';

/**
 * Avatar dropdown — top-right of the app shell on both desktop and mobile.
 *
 * Contents:
 *   - User identity row (avatar + name + role badge)
 *   - ThemeSwitch (system / light / dark) — per spec Q10d
 *   - Profile link
 *   - Sign out (calls useLogout)
 */
export const AppAvatarMenu = ({ className }: AppAvatarMenuProps) => {
  const { data: user } = useProfile();
  const logout = useLogout();

  const initials = initialsFrom(user?.name, user?.email);
  const displayName = user?.name || 'Pigmemento user';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className={cn(
            'inline-flex items-center justify-center rounded-full',
            'transition-all ease-considered duration-150',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'hover:brightness-105',
            className,
          )}
        >
          <Avatar className="border-hairline h-8 w-8 border">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback className="font-mono text-[0.65rem]">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-72 rounded-card border-hairline shadow-warm-lifted p-3"
      >
        {/* Identity */}
        <div className="flex items-center gap-3 px-1 py-1.5">
          <Avatar className="border-hairline h-10 w-10 border">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback className="font-mono text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">
              {displayName}
            </p>
            {user?.email && (
              <p className="text-muted-foreground truncate text-xs">
                {user.email}
              </p>
            )}
            {user?.role && (
              <Badge variant="outline" className="mt-1 capitalize">
                {user.role}
              </Badge>
            )}
          </div>
        </div>

        <Hairline className="my-3" />

        {/* Theme */}
        <DropdownMenuLabel className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase px-1 pb-2">
          Theme
        </DropdownMenuLabel>
        {/* Stop click-propagation so clicking the switch doesn't dismiss the
            dropdown — radix DropdownMenu auto-closes on interactive children. */}
        <div onClick={(e) => e.stopPropagation()} className="px-1">
          <ThemeSwitch />
        </div>

        <Hairline className="my-3" />

        <DropdownMenuItem asChild>
          <Link
            to={paths.app.profile.getHref()}
            className="flex items-center gap-2"
          >
            <User2 className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive flex items-center gap-2"
          onSelect={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
