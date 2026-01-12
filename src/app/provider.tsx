import { queryConfig } from '@/lib/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PropsWithChildren, Suspense, useState } from 'react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';

export const AppProvider = (props: PropsWithChildren) => {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: queryConfig }),
  );

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          {import.meta.env.DEV && <ReactQueryDevtools />}
          {props.children}
        </HelmetProvider>
      </QueryClientProvider>
    </Suspense>
  );
};
