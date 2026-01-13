import { NavLink } from 'react-router';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '../ui/sidebar.tsx';
import { paths } from '@/config/paths.ts';
import { Home, Library, Timer, EllipsisVertical } from 'lucide-react';
import { JSX, SVGProps } from 'react';
import { cn } from '@/lib/utils.ts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.tsx';
import { Badge } from '../ui/badge.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.tsx';
import LogoutDialog from '@/features/auth/components/logout-dialog.tsx';
import { useProfile } from '@/features/profile/api/use-profile.ts';

type SideNavigationItem = {
  name: string;
  to: string;
  end?: boolean;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

const AppSidebar = () => {
  const { data: user } = useProfile();

  const initials =
    (user?.name || user?.email || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U';

  const displayName = user?.name || 'Pigmemento User';

  const appNavigation = [
    { name: 'Dashboard', to: paths.app.dashboard.getHref(), icon: Home },
  ].filter(Boolean) as SideNavigationItem[];

  const casesNavigation = [
    {
      name: 'Case Library',
      to: paths.app.cases.getHref(),
      end: true,
      icon: Library,
    },
    {
      name: 'Drills',
      to: paths.app['case-drill'].getHref(),
      icon: Timer,
    },
  ].filter(Boolean) as SideNavigationItem[];

  return (
    <Sidebar>
      <SidebarHeader>
        <NavLink to={paths.app.dashboard.getHref()} className="block">
          <div className="flex items-center gap-2 px-2 py-2">
            <img
              src="/android-chrome-512x512.png"
              alt="Pigmemento"
              className="h-8 w-auto"
            />
            <span className="text-sm font-semibold tracking-tight">
              Pigmemento
            </span>
          </div>
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {appNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <NavLink to={item.to} end={item.end}>
                    {({ isActive }) => (
                      <SidebarMenuButton
                        asChild
                        className={isActive ? 'bg-secondary text-primary' : ''}
                      >
                        <span className="flex items-center gap-2">
                          <item.icon strokeWidth={isActive ? 2.5 : 1} />
                          <span className={cn(isActive ? 'font-bold' : '')}>
                            {item.name}
                          </span>
                        </span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Cases</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {casesNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <NavLink to={item.to} end={item.end}>
                    {({ isActive }) => (
                      <SidebarMenuButton
                        asChild
                        className={isActive ? 'bg-secondary text-primary' : ''}
                      >
                        <span className="flex items-center gap-2">
                          <item.icon strokeWidth={isActive ? 2.5 : 1} />
                          <span className={cn(isActive ? 'font-bold' : '')}>
                            {item.name}
                          </span>
                        </span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="flex justify-between">
                  <span className="flex gap-2 items-center">
                    <Avatar>
                      <AvatarImage src="" alt="profile image" />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{displayName}</span>
                  </span>
                  <EllipsisVertical />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right">
                <div className="px-2 py-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Role</span>
                    <Badge variant="secondary" className="capitalize">
                      {user?.role ?? 'user'}
                    </Badge>
                  </div>
                </div>

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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
export default AppSidebar;
