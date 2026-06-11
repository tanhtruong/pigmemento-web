import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { GrainOverlay } from '@/components/foundation/grain-overlay';
import { AmberGlow } from '@/components/foundation/amber-glow';
import { paths } from '@/config/paths';

/**
 * 404 — locked microcopy from spec § 13d:
 *   "This page slipped off the slide."
 *
 * Rendered against the dark cinematic voice (same as the auth + landing
 * surface) — the user is by definition outside the app shell here, so the
 * editorial dark register feels right.
 */
const NotFoundRoute = () => {
  return (
    <div className="dark bg-background text-foreground relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <GrainOverlay intensity={1.4} />
      <AmberGlow
        size="xl"
        variant="soft"
        className="left-1/2 top-1/3 -z-10 -translate-x-1/2 -translate-y-1/2 opacity-50"
      />

      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <p className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
          404
        </p>
        <h1 className="font-display text-foreground text-6xl leading-none tracking-tight md:text-7xl">
          This page slipped off the slide.
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          That URL doesn’t map to any case in the library. The pattern might
          still be there — try the home page or start a fresh case.
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Button asChild size="lg">
            <Link to={paths.home.getHref()} replace>
              Back to home
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link to={paths.app['case-random'].getHref()} replace>
              Start a case
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundRoute;
