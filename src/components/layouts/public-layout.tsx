import { Outlet } from 'react-router';
import { useEffect } from 'react';

import { PublicFooter } from '@/components/layouts/public-footer.tsx';
import { PublicHeader } from '@/components/layouts/public-header.tsx';
import { GrainOverlay } from '@/components/foundation/grain-overlay.tsx';
import { SkipToContent } from '@/components/foundation/skip-to-content.tsx';

/**
 * Public layout = landing + privacy + any pre-auth surface.
 *
 * Per spec section 2: the landing is dark-first. We pin `dark` on the
 * layout root so every public route inherits the cinematic graphite voice
 * regardless of the user's system preference or stored theme. (PR12 may
 * introduce an explicit landing theme-toggle; until then, dark is the
 * deliberate first impression.)
 */
export const PublicLayout = () => {
  // Pin `.dark` on <body> so Radix portals (dialogs, popovers etc.) inherit
  // the cinematic graphite tokens. The `.dark` class on this div alone
  // doesn't reach portaled content.
  useEffect(() => {
    document.body.classList.add('dark');
    return () => document.body.classList.remove('dark');
  }, []);

  return (
    <div className="dark bg-background text-foreground relative isolate flex min-h-screen flex-col">
      <SkipToContent />
      <GrainOverlay intensity={1.4} />
      <PublicHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 mx-auto w-full flex-1 focus:outline-none"
      >
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
};
