import { useQueryClient } from '@tanstack/react-query';

import { paths } from '@/config/paths';
import { useTransitionNavigate } from '@/components/motion/transition-conductor';
import { endSession } from '@/lib/end-session';

/**
 * Sign-out as a commit gesture: tear the session down, then let the
 * conductor's exit-app bloom carry the user back to the landing — amber
 * from the gesture origin, settling into graphite. The bloom is the
 * goodbye; no toast competes with it.
 *
 * Shared by every sign-out surface (avatar menu, command palette) so the
 * rule holds everywhere: logout always blooms.
 */
export const useLogoutTransition = () => {
  const queryClient = useQueryClient();
  const startTransition = useTransitionNavigate();

  return (origin: { x: number; y: number }) => {
    endSession(queryClient);
    startTransition({
      kind: 'exit-app',
      origin,
      destination: paths.home.getHref(),
    });
  };
};
