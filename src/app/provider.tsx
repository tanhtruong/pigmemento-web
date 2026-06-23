import { queryClient } from '@/lib/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PropsWithChildren, Suspense } from 'react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { ThemeProvider } from 'next-themes';

export const AppProvider = (props: PropsWithChildren) => {
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
