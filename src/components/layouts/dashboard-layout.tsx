import { SidebarProvider } from '../ui/sidebar';
import AppSidebar from './app-sidebar.tsx';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ReactNode } from 'react';
import AppTopBar from '@/components/layouts/app-topbar.tsx';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Helmet title="Pigmemento" />

      <div className="flex h-dvh min-h-0 w-full">
        {/* Desktop sidebar */}
        <div className="hidden md:block shrink-0">
          <AppSidebar />
        </div>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile topbar: takes up height (no sticky needed because content scrolls below) */}
          <div className="md:hidden shrink-0 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <AppTopBar />
          </div>

          {/* Scrollable content area */}
          <main className="min-h-0 flex-1 overflow-auto p-4 sm:px-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
