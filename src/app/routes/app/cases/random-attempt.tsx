import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { useInAppNavigate } from '@/components/layouts/use-in-app-navigate.ts';
import { paths } from '@/config/paths';
import {
  randomCaseQueryOptions,
  useRandomCase,
} from '@/features/cases/api/use-case-random.ts';
import { prefetchWithCap } from '@/lib/route-loaders.ts';
import { CaseAttemptSkeleton } from '@/components/cases/case-attempt-skeleton.tsx';
import { CaseAttemptFlow } from './case-attempt-flow.tsx';
import { queryKeys } from '@/lib/query-keys.ts';
import { useRandomCasePeek } from '@/features/cases/hooks/use-random-case-peek.ts';

/**
 * Prefetch a random case before the surface mounts (#60), capped so a slow
 * fetch never blocks navigation — the surface then shows the developing
 * skeleton. Wired by the router's `convert()` via the `clientLoader` export.
 */
export const clientLoader = (queryClient: QueryClient) => () =>
  prefetchWithCap(queryClient.ensureQueryData(randomCaseQueryOptions()));

const RandomCaseScene = () => {
  const inAppNavigate = useInAppNavigate();
  const queryClient = useQueryClient();
  // Look one case ahead so "Next" promotes an already-decoded lesion (#100).
  const { promoteNext } = useRandomCasePeek();

  const { data: caseItem, isLoading, isError } = useRandomCase();

  if (isLoading) {
    return <CaseAttemptSkeleton />;
  }

  if (isError || !caseItem) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <h2 className="font-display text-4xl">Couldn’t fetch a case.</h2>
        <p className="text-muted-foreground text-sm">
          The Library might be empty, or you may not have access.
        </p>
        <Button asChild>
          <Link to={paths.app.cases.getHref()} viewTransition>
            Back to library
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <CaseAttemptFlow
      caseItem={caseItem}
      // "Next case" promotes the pre-decoded peek for an instant in-frame
      // handoff (#100); if none has landed yet, fall back to a live refetch —
      // the flow resets when the new case id arrives.
      onNextCase={() => {
        if (!promoteNext()) {
          queryClient.invalidateQueries({ queryKey: queryKeys['random-case'] });
        }
      }}
      onExit={() => inAppNavigate(paths.app.cases.getHref())}
      headerActionsNode={
        <Button asChild variant="ghost" size="sm">
          <Link to={paths.app.cases.getHref()} viewTransition>
            ← Library
          </Link>
        </Button>
      }
    />
  );
};

export default RandomCaseScene;
