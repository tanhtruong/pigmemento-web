import { createRoot } from 'react-dom/client';

import { env } from '@/config/env';
import { App } from './app';

/**
 * Start the MSW browser worker before mounting when API mocking is enabled
 * (`VITE_APP_ENABLE_API_MOCKING=true`). The dynamic import keeps MSW out of the
 * production bundle, and the flag is unset in production, so this is a no-op
 * there.
 */
const enableMocking = async () => {
  if (!env.ENABLE_API_MOCKING) return;
  const { worker } = await import('@/testing/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
};

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(<App />);
});
