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
import { ArrowRight, Book, Home } from 'lucide-react';
import { JSX } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import LogoutDialog from '@/features/auth/components/logout-dialog';

type SideNavigationItem = {
  name: string;
  to: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
};

const AppSidebar = () => {
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
                        <item.icon strokeWidth={isActive ? 3 : 1} />
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
                      <AvatarFallback>ATT</AvatarFallback>
                    </Avatar>{' '}
                    Name
                  </span>
                  <ArrowRight />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right">
                <DropdownMenuItem>
                  <span>Account</span>
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
