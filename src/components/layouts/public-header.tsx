import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

import { Button } from '@/components/ui/button.tsx';
import { paths } from '@/config/paths.ts';
import { isTokenValid } from '@/lib/auth.tsx';

export const PublicHeader = () => {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = isTokenValid();

  const handleStart = () => {
    return isLoggedIn
      ? paths.app.dashboard.getHref()
      : paths.auth.login.getHref();
  };

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const scrollToId = (id: string) => {
    // If we're not on the landing page, navigate first and let the landing page scroll on mount
    if (location.pathname !== paths.home.path) {
      navigate(paths.home.path, { replace: false, state: { scrollTo: id } });
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  };

  const scrollToIdAndClose = (id: string) => {
    scrollToId(id);
    setMobileNavOpen(false);
  };

  // Close mobile nav when navigating to a new route (e.g., Privacy)
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Ensure legal pages start at the top (SPA navigation preserves scroll position)
  useEffect(() => {
    if (location.pathname === paths.privacy.path) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-4">
        <Link
          to={paths.home.path}
          className="flex items-center gap-2 font-semibold tracking-tight"
          aria-label="Pigmemento home"
          onClick={(e) => {
            // Ensure the landing page is mounted before attempting to scroll to top
            if (location.pathname !== paths.home.path) {
              e.preventDefault();
              navigate(paths.home.path, {
                replace: false,
                state: { scrollTo: '__top__' },
              });
              setMobileNavOpen(false);
              return;
            }

            window.scrollTo({
              top: 0,
              behavior: shouldReduceMotion ? 'auto' : 'smooth',
            });
            setMobileNavOpen(false);
          }}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
            P
          </span>
          <span className="text-sm md:text-base">Pigmemento</span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden items-center gap-6 text-sm text-neutral-700 md:flex"
          aria-label="Primary"
        >
          <button
            type="button"
            onClick={() => scrollToId('features')}
            className="hover:text-neutral-900"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollToId('how')}
            className="hover:text-neutral-900"
          >
            How it works
          </button>
          <button
            type="button"
            onClick={() => scrollToId('faq')}
            className="hover:text-neutral-900"
          >
            FAQ
          </button>
          <Link
            to={paths.privacy.path}
            className="hover:text-neutral-900"
            onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
          >
            Privacy
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 md:flex">
          {/*<Button variant="ghost" onClick={() => scrollToId('waitlist')}>
            Join waitlist
          </Button>*/}
          <Button onClick={() => scrollToId('waitlist')} asChild>
            <Link to={handleStart()}>
              Log in <ArrowRight />
            </Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-neutral-700 hover:bg-neutral-100 md:hidden"
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((v) => !v)}
        >
          {mobileNavOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile nav panel */}
      {mobileNavOpen ? (
        <div className="border-t bg-white md:hidden">
          <div className="mx-auto w-full max-w-6xl px-6 py-4">
            <div className="flex flex-col gap-3 text-sm text-neutral-700">
              <button
                type="button"
                onClick={() => scrollToIdAndClose('features')}
                className="text-left hover:text-neutral-900"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollToIdAndClose('how')}
                className="text-left hover:text-neutral-900"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => scrollToIdAndClose('faq')}
                className="text-left hover:text-neutral-900"
              >
                FAQ
              </button>
              <Link
                to={paths.privacy.path}
                className="hover:text-neutral-900"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'auto' });
                  setMobileNavOpen(false);
                }}
              >
                Privacy
              </Link>
              {/*<div className="pt-2">
                <Button
                  className="w-full"
                  onClick={() => scrollToIdAndClose('waitlist')}
                >
                  Get early access <ArrowRight />
                </Button>
              </div>*/}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};
