import { cn } from '@/utils/cn';

type SkipToContentProps = {
  /** ID of the main content region this link targets. */
  href?: string;
  className?: string;
};

/**
 * Universal skip-to-content link.
 *
 * Visually hidden until focused — a keyboard user can press Tab from the
 * URL bar and jump straight into the page content past the nav chrome.
 * Mounted at the top of every shell (PublicLayout + DashboardLayout).
 */
export const SkipToContent = ({
  href = '#main-content',
  className,
}: SkipToContentProps) => (
  <a
    href={href}
    className={cn(
      // Visible only when focused — slides down into view from above the nav.
      'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]',
      'focus:bg-primary focus:text-primary-foreground focus:rounded-input focus:px-4 focus:py-2',
      'focus:shadow-amber-glow focus:font-medium focus:no-underline',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className,
    )}
  >
    Skip to content
  </a>
);
