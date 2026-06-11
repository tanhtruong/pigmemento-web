import { Outlet } from 'react-router';
import { PublicFooter } from '@/components/layouts/public-footer.tsx';
import { PublicHeader } from '@/components/layouts/public-header.tsx';
import { GrainOverlay } from '@/components/foundation/grain-overlay.tsx';

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
  return (
    <div className="dark bg-background text-foreground relative isolate flex min-h-screen flex-col">
      <GrainOverlay intensity={1.4} />
      <PublicHeader />

      <main className="relative z-10 mx-auto w-full flex-1">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
};
