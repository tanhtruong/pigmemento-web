import { paths } from '@/config/paths';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Suspense, useMemo } from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';

import {
  default as AppRoot,
  ErrorBoundary as AppRootErrorBoundary,
} from './routes/app/root';
import { ProtectedRoute } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';
import { PublicLayout } from '@/components/layouts/public-layout.tsx';
import { TransitionConductor } from '@/components/motion/transition-conductor.tsx';

const convert = (queryClient: QueryClient) => (m: any) => {
  const { clientLoader, clientAction, default: Component, ...rest } = m;
  return {
    ...rest,
    loader: clientLoader?.(queryClient),
    action: clientAction?.(queryClient),
    Component,
  };
};

export const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      // Pathless root shell — the TransitionConductor persists across every
      // route swap so it can narrate the landing/auth/app boundary hops (#43).
      element: <TransitionConductor />,
      children: [
        {
          element: <PublicLayout />,
          children: [
            {
              path: paths.home.path,
              lazy: () => import('./routes/landing').then(convert(queryClient)),
            },
            {
              path: paths.privacy.path,
              lazy: () =>
                import('./routes/privacy-policy').then(convert(queryClient)),
            },
            {
              // Temporary parallel build of the 3D-first landing rebuild
              // (epic #125). Unlisted + noindex; `/` adopts it at cutover (#133).
              path: '/next',
              lazy: () =>
                import('./routes/landing-next').then(convert(queryClient)),
            },
          ],
        },
        {
          path: paths.auth.login.path,
          lazy: () => import('./routes/auth/login').then(convert(queryClient)),
        },
        {
          path: paths.auth.register.path,
          lazy: () =>
            import('./routes/auth/register').then(convert(queryClient)),
        },
        {
          path: paths.app.root.path,
          element: (
            <ProtectedRoute>
              <Suspense fallback={<Spinner />}>
                <AppRoot />
              </Suspense>
            </ProtectedRoute>
          ),
          ErrorBoundary: AppRootErrorBoundary,
          children: [
            {
              path: paths.app.dashboard.path,
              lazy: () =>
                import('./routes/app/dashboard').then(convert(queryClient)),
            },
            {
              path: paths.app.cases.path,
              lazy: () =>
                import('./routes/app/cases/cases').then(convert(queryClient)),
            },
            {
              path: paths.app['case-random'].path,
              lazy: () =>
                import('./routes/app/cases/random-attempt').then(
                  convert(queryClient),
                ),
            },
            {
              path: paths.app['case-attempt'].path,
              lazy: () =>
                import('./routes/app/cases/case-attempt').then(
                  convert(queryClient),
                ),
            },
            {
              path: paths.app['case-drill'].path,
              lazy: () =>
                import('./routes/app/cases/case-drill').then(
                  convert(queryClient),
                ),
            },
            {
              path: paths.app.profile.path,
              lazy: () =>
                import('./routes/app/profile').then(convert(queryClient)),
            },
          ],
        },
        {
          path: '/dev/motion',
          lazy: () => import('./routes/dev-motion').then(convert(queryClient)),
        },
        {
          path: '*',
          lazy: () => import('./routes/not-found').then(convert(queryClient)),
        },
      ],
    },
  ]);

export const AppRouter = () => {
  const queryClient = useQueryClient();

  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

  return <RouterProvider router={router} />;
};
