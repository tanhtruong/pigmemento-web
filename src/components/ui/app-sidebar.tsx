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
} from './sidebar';
import { paths } from '@/config/paths';
import { Book, EllipsisVertical, Home } from 'lucide-react';
import { JSX, SVGProps } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import LogoutDialog from '@/features/auth/components/logout-dialog';
import { useProfile } from '@/features/profile/api/use-profile';

type SideNavigationItem = {
  name: string;
  to: string;
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

  const navigation = [
    { name: 'Dashboard', to: paths.app.dashboard.getHref(), icon: Home },
    { name: 'Cases', to: paths.app.cases.getHref(), icon: Book },
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
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <NavLink to={item.to}>
                    {({ isActive }) => (
                      <SidebarMenuButton
                        className={isActive ? 'bg-secondary' : ''}
                      >
                        <item.icon
                          strokeWidth={isActive ? 3 : 1}
                          color={
                            isActive
                              ? 'var(--sidebar-primary)'
                              : 'var(--sidebar-foreground)'
                          }
                        />
                        <span
                          className={cn(
                            isActive ? 'text-primary font-bold' : '',
                          )}
                        >
                          {item.name}
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
