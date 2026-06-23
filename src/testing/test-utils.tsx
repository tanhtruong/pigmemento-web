import { type ReactElement, type ReactNode } from 'react';
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
  type RenderHookOptions,
  type RenderOptions,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { ThemeProvider } from 'next-themes';
import { MemoryRouter } from 'react-router';

/**
 * Render helpers that wrap the unit under test in the same providers the app
 * mounts — TanStack Query, Helmet, theme, router — but never the singletons.
 * Each render gets a FRESH QueryClient so cache never bleeds between tests, with
 * retries off so a failing query rejects immediately instead of stalling the
 * fake clock.
 *
 * This module re-exports the whole @testing-library/react API, so a test can
 * import everything from '@/testing/test-utils'; the custom `render` /
 * `renderHook` below shadow RTL's same-named exports.
 */
const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

type ProviderOptions = {
  /** Initial history stack for the in-memory router (default `['/']`). */
  routerEntries?: string[];
};

const wrapperFor =
  ({ routerEntries = ['/'] }: ProviderOptions) =>
  ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={createTestQueryClient()}>
      <HelmetProvider>
        <ThemeProvider attribute="class" defaultTheme="light">
          <MemoryRouter initialEntries={routerEntries}>{children}</MemoryRouter>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );

export const render = (
  ui: ReactElement,
  { routerEntries, ...options }: RenderOptions & ProviderOptions = {},
) => rtlRender(ui, { wrapper: wrapperFor({ routerEntries }), ...options });

export const renderHook = <Result, Props>(
  hook: (initialProps: Props) => Result,
  {
    routerEntries,
    ...options
  }: RenderHookOptions<Props> & ProviderOptions = {},
) =>
  rtlRenderHook(hook, { wrapper: wrapperFor({ routerEntries }), ...options });

export * from '@testing-library/react';
