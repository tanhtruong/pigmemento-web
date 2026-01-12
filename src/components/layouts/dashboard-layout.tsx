import { SidebarProvider } from '../ui/sidebar';
import AppSidebar from '../ui/app-sidebar';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ReactNode } from 'react';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Helmet title="Pigmemento" />
      <AppSidebar />

      <main className="h-dvh min-h-0 min-w-0 w-full grid flex-1 items-start gap-4 p-4 overflow-auto sm:px-6 sm:py-0 md:gap-8">
        {children}
      </main>
    </SidebarProvider>
  );
}
