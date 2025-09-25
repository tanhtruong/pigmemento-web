import { SidebarProvider } from '../ui/sidebar';
import AppSidebar from '../ui/app-sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        {children}
      </main>
    </SidebarProvider>
  );
}
