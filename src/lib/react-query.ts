import {
  QueryClient,
  UseMutationOptions,
  DefaultOptions,
} from '@tanstack/react-query';

export const queryConfig = {
  queries: {
    // throwOnError: true,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60,
  },
} satisfies DefaultOptions;

/**
 * The app's single QueryClient. A module singleton (not created in a component)
 * so non-React callers — notably the axios 401 interceptor — can reach it to
 * tear the Session's cache down. `AppProvider` provides this same instance, so
 * `useQueryClient()` returns it inside the tree.
 */
export const queryClient = new QueryClient({ defaultOptions: queryConfig });

export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> =
  Awaited<ReturnType<FnType>>;

export type QueryConfig<T extends (...args: any[]) => any> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>;

export type MutationConfig<
  MutationFnType extends (...args: any) => Promise<any>,
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>;
