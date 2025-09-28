import { AppProvider } from './provider';
import { AppRouter } from './router';
import './index.css';
import { BreakpointIndicator } from '@/components/development-tools/breakpoint-indicator';
import { Toaster } from '@/components/ui/sonner';

export const App = () => {
  return (
    <AppProvider>
      <AppRouter />
      <Toaster />
      <BreakpointIndicator />
    </AppProvider>
  );
};
