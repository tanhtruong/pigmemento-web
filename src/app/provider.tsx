import { queryConfig } from '@/lib/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PropsWithChildren, Suspense, useState } from 'react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { ThemeProvider } from 'next-themes';

export const AppProvider = (props: PropsWithChildren) => {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: queryConfig }),
  );

  return (
    <Suspense
      fallback={
        <div className="bg-background text-foreground flex h-screen w-screen items-center justify-center font-sans">
          Loading…
        </div>
      }
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            {import.meta.env.DEV && <ReactQueryDevtools />}
            {props.children}
          </HelmetProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Suspense>
  );
};
