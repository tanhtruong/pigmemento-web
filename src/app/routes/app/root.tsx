import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { RouteTransitionOutlet } from '@/components/motion/route-transition-outlet';

export const ErrorBoundary = () => {
  return <div>Something went wrong!</div>;
};

const AppRoot = () => {
  return (
    <DashboardLayout>
      <RouteTransitionOutlet />
    </DashboardLayout>
  );
};

export default AppRoot;
