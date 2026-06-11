import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

import { Button } from '@/components/ui/button.tsx';
import { paths } from '@/config/paths.ts';
import { isTokenValid } from '@/lib/auth.tsx';

/**
 * PublicHeader — the minimal header for non-landing public routes (currently
 * just /privacy). On the landing route this component renders nothing — the
 * ScrollRail owns nav there.
 *
 * The header strips section-scroll buttons since those anchors only exist on
 * the landing route. What's left is the brand mark on the left (clickable
 * "back to home") and the Log in CTA on the right — the two affordances a
 * user on a legal page actually needs.
 */
export const PublicHeader = () => {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = isTokenValid();

  // Landing owns its own scroll-born rail; suppress the standard header here.
  if (location.pathname === paths.home.path) {
    return null;
  }

  const loginHref = isLoggedIn
    ? paths.app.dashboard.getHref()
    : paths.auth.login.getHref();

  return (
    <header className="border-hairline bg-background/75 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-4">
        <Link
          to={paths.home.path}
          className="flex items-center gap-2 font-semibold tracking-tight"
          aria-label="Pigmemento home"
          onClick={(e) => {
            if (location.pathname !== paths.home.path) {
              e.preventDefault();
              navigate(paths.home.path, {
                replace: false,
                state: { scrollTo: '__top__' },
              });
              return;
            }
            window.scrollTo({
              top: 0,
              behavior: shouldReduceMotion ? 'auto' : 'smooth',
            });
          }}
        >
          <span className="bg-primary text-primary-foreground font-display inline-flex h-8 w-8 items-center justify-center rounded-button">
            P
          </span>
          <span className="text-foreground text-sm md:text-base">
            Pigmemento
          </span>
        </Link>

        <Button asChild size="sm">
          <Link to={loginHref}>
            Log in <ArrowRight />
          </Link>
        </Button>
      </div>
    </header>
  );
};
