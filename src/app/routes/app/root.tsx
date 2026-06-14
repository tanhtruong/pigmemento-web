import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { AppRouteOutlet } from '@/components/motion/app-route-outlet';

export const ErrorBoundary = () => {
  return <div>Something went wrong!</div>;
};

const AppRoot = () => {
  return (
    <DashboardLayout>
      <AppRouteOutlet />
    </DashboardLayout>
  );
};

export default AppRoot;
