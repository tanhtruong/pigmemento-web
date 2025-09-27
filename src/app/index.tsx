import { AppProvider } from './provider';
import { AppRouter } from './router';
import './index.css';
import { BreakpointIndicator } from '@/components/development-tools/breakpoint-indicator';

export const App = () => {
  return (
    <AppProvider>
      <AppRouter />
      <BreakpointIndicator />
    </AppProvider>
  );
};
