import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowRight, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthEntry } from '@/features/auth/hooks/use-auth-entry';
import { motionDurations } from '@/lib/motion-tokens';

/**
 * ScrollRail — the scroll-born film-strip nav for the landing page.
 *
 * Born from scroll: the rail is hidden while the hero owns the viewport, and
 * slides in from above once the user has scrolled past ~60% of the first
 * viewport-height. From then on, an amber playhead dot glides along the rail's
 * hairline border driven by overall page-scroll progress — naturally slowing
 * inside the centerpiece / Why / FAQ pins because the document scroll height
 * expands there. Section frames are clickable smooth-scroll targets; the
 * terminal LOG IN frame is a route-link, amber-tinted from page-load so it
 * reads as a destination, not a section.
 *
 * Mobile collapses the rail to a corner chip showing the current section in
 * mono caps; tapping the chip opens a frame menu overlay below it.
 */

type Frame = {
  key: 'case' | 'why' | 'faq' | 'start';
  label: string;
  sectionId: string;
};

const FRAMES: Frame[] = [
  { key: 'case', label: 'Case', sectionId: 'how' },
  { key: 'why', label: 'Why', sectionId: 'why' },
  { key: 'faq', label: 'FAQ', sectionId: 'faq' },
  { key: 'start', label: 'Start', sectionId: 'cta' },
];

/** Sentinel section ids observed by IntersectionObserver to track active frame. */
const TRACKED_SECTION_IDS = FRAMES.map((f) => f.sectionId);

export const ScrollRail = () => {
  const shouldReduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('how');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { scrollY, scrollYProgress } = useScroll();

  // Playhead position — clamped so it sits at the start of the strip while the
  // hero is in view and reaches the end as the page bottom approaches.
  const rawPlayhead = useTransform(scrollYProgress, [0.08, 0.95], [0, 100], {
    clamp: true,
  });
  const playheadX = useSpring(rawPlayhead, {
    stiffness: 140,
    damping: 28,
    mass: 0.6,
  });
  // Hoisted so the rules-of-hooks call order is stable across the
  // AnimatePresence-gated render below — calling useTransform inside the
  // returned JSX flips the hook count when `visible` toggles.
  const playheadLeft = useTransform(playheadX, (v) => `calc(${v}% - 3px)`);

  // Show the rail once the hero is mostly gone.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const threshold = window.innerHeight * 0.6;
    setVisible(y > threshold);
  });

  // Track which tracked section is most visible — drives the active frame.
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    TRACKED_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveSection(id);
          });
        },
        {
          // Trigger when section center enters the upper-middle of the viewport.
          // The negative bottom margin avoids two sections being "active" at once
          // during long pinned scrubs.
          rootMargin: '-30% 0px -50% 0px',
          threshold: 0,
        },
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Close mobile menu on any frame click or scroll.
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const close = () => setMobileMenuOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [mobileMenuOpen]);

  const loginEntry = useAuthEntry();

  const handleFrameClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    setMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
    setMobileMenuOpen(false);
  };

  const activeFrameIndex = FRAMES.findIndex(
    (f) => f.sectionId === activeSection,
  );
  const activeFrame =
    activeFrameIndex >= 0 ? FRAMES[activeFrameIndex] : FRAMES[0];

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="rail"
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : motionDurations.considered,
            ease: [0.2, 0.8, 0.2, 1],
          }}
          className="border-hairline bg-background/80 fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md"
          aria-label="Section navigation"
        >
          {/* ─── Desktop rail ─────────────────────────────────────────── */}
          <div className="relative mx-auto hidden h-11 w-full max-w-6xl items-center gap-6 px-6 md:flex">
            {/* Logo bug — clickable home */}
            <a
              href="/"
              onClick={handleLogoClick}
              className="group/logo focus-visible:ring-ring relative inline-flex h-6 w-6 items-center justify-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Pigmemento home"
            >
              <span className="bg-primary text-primary-foreground font-display absolute inset-0 flex items-center justify-center rounded-sm text-[0.7rem] leading-none">
                P
              </span>
            </a>

            {/* Frame strip — playhead glides along the rail's bottom border */}
            <nav
              aria-label="Page sections"
              className="relative flex flex-1 items-center justify-start gap-1"
            >
              {FRAMES.map((frame, index) => {
                const isActive = activeSection === frame.sectionId;
                return (
                  <button
                    key={frame.key}
                    type="button"
                    onClick={() => handleFrameClick(frame.sectionId)}
                    className={cn(
                      'ease-considered group/frame relative inline-flex items-baseline gap-1.5 rounded-sm px-3 py-1 font-mono text-[0.65rem] tracking-[0.22em] uppercase transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-primary focus:outline-none',
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground/80',
                    )}
                  >
                    <span
                      className={cn(
                        'tabular-nums transition-colors duration-200',
                        isActive ? 'text-primary' : 'text-muted-foreground/60',
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{frame.label}</span>
                    {isActive ? (
                      <motion.span
                        layoutId="rail-active-underline"
                        className="bg-primary absolute -bottom-px left-3 right-3 h-px"
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.32,
                          ease: [0.2, 0.8, 0.2, 1],
                        }}
                      />
                    ) : null}
                  </button>
                );
              })}
            </nav>

            {/* Terminal LOG IN frame — amber-tinted from page-load */}
            <Link
              to={loginEntry.href}
              onClick={loginEntry.onClick}
              onMouseEnter={loginEntry.onMouseEnter}
              onFocus={loginEntry.onFocus}
              className="border-hairline group/login bg-primary/10 hover:bg-primary/15 ease-considered inline-flex items-center gap-1.5 rounded-sm border px-3 py-1 font-mono text-[0.65rem] tracking-[0.22em] uppercase transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-primary focus:outline-none"
            >
              <span className="text-primary">Log in</span>
              <ArrowRight className="text-primary h-3 w-3 transition-transform duration-200 group-hover/login:translate-x-0.5" />
            </Link>

            {/* Playhead — sub-pixel-smooth amber dot riding the bottom border.
                Positioned by useSpring(useTransform(scrollYProgress)). The dot
                sits exactly on the hairline so the rail's edge stays continuous. */}
            <motion.span
              aria-hidden
              className="bg-primary pointer-events-none absolute -bottom-[3px] h-1.5 w-1.5 rounded-full"
              style={{
                left: playheadLeft,
                boxShadow:
                  '0 0 0 2px var(--background), 0 0 12px var(--primary)',
              }}
            />
          </div>

          {/* ─── Mobile rail — collapsed chip ─────────────────────────── */}
          <div className="relative flex h-11 items-center justify-between px-4 md:hidden">
            <a
              href="/"
              onClick={handleLogoClick}
              className="bg-primary text-primary-foreground font-display inline-flex h-6 w-6 items-center justify-center rounded-sm text-[0.7rem] leading-none"
              aria-label="Pigmemento home"
            >
              P
            </a>

            <div className="flex items-center gap-2">
              <Link
                to={loginEntry.href}
                onClick={loginEntry.onClick}
                onMouseEnter={loginEntry.onMouseEnter}
                onFocus={loginEntry.onFocus}
                className="border-hairline bg-primary/10 inline-flex items-center gap-1 rounded-sm border px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.22em] uppercase"
              >
                <span className="text-primary">Log in</span>
                <ArrowRight className="text-primary h-3 w-3" />
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle section menu"
                className="border-hairline bg-background/40 inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.22em] uppercase"
              >
                <span className="text-primary tabular-nums">
                  {String(activeFrameIndex + 1).padStart(2, '0')}
                </span>
                <span className="text-foreground">{activeFrame.label}</span>
                <ChevronDown
                  className={cn(
                    'text-muted-foreground h-3 w-3 transition-transform duration-200',
                    mobileMenuOpen && 'rotate-180',
                  )}
                />
              </button>
            </div>

            {/* Mobile playhead — same hairline rail, smaller */}
            <motion.span
              aria-hidden
              className="bg-primary pointer-events-none absolute -bottom-[3px] h-1.5 w-1.5 rounded-full"
              style={{
                left: playheadLeft,
                boxShadow:
                  '0 0 0 2px var(--background), 0 0 8px var(--primary)',
              }}
            />
          </div>

          {/* Mobile drop-down panel */}
          <AnimatePresence>
            {mobileMenuOpen ? (
              <motion.div
                key="mobile-menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : motionDurations.quick,
                }}
                className="border-hairline bg-background/95 absolute inset-x-0 top-full border-b backdrop-blur-md md:hidden"
              >
                <ul className="flex flex-col divide-y divide-[var(--hairline)]">
                  {FRAMES.map((frame, index) => {
                    const isActive = activeSection === frame.sectionId;
                    return (
                      <li key={frame.key}>
                        <button
                          type="button"
                          onClick={() => handleFrameClick(frame.sectionId)}
                          className={cn(
                            'flex w-full items-baseline gap-3 px-4 py-3 font-mono text-xs tracking-[0.22em] uppercase',
                            isActive
                              ? 'text-foreground bg-primary/5'
                              : 'text-muted-foreground',
                          )}
                        >
                          <span
                            className={cn(
                              'tabular-nums',
                              isActive
                                ? 'text-primary'
                                : 'text-muted-foreground/60',
                            )}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span>{frame.label}</span>
                          {isActive ? (
                            <span className="bg-primary ml-auto h-1.5 w-1.5 rounded-full" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
