import { useEffect } from 'react';

type Choice = 'benign' | 'malignant' | 'skipped';

/**
 * Keyboard shortcuts for the case-attempt flow.
 *
 * Per spec section 11: tap (or key) = commit. There is no separate Submit
 * button — pressing B / M / S commits the chosen answer directly.
 *   N      → load a new random case
 *   Escape → return to the Library
 */
export const useCaseAttemptShortcuts = (opts: {
  enabled: boolean;
  /** Disabled when a commit is in-flight. */
  isPending: boolean;
  /** Direct-commit handler. Receives the chosen label. */
  onCommit: (choice: Choice) => void;
  onNewCase: () => void;
  onExit: () => void;
}) => {
  const isTypingTarget = (el: EventTarget | null) => {
    const node = el as HTMLElement | null;
    if (!node) return false;
    const tag = node.tagName?.toLowerCase();
    return (
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select' ||
      Boolean(node.isContentEditable)
    );
  };

  useEffect(() => {
    if (!opts.enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key.toLowerCase();

      if (key === 'b') {
        e.preventDefault();
        if (!opts.isPending) opts.onCommit('benign');
        return;
      }

      if (key === 'm') {
        e.preventDefault();
        if (!opts.isPending) opts.onCommit('malignant');
        return;
      }

      if (key === 's') {
        e.preventDefault();
        if (!opts.isPending) opts.onCommit('skipped');
        return;
      }

      if (key === 'n') {
        e.preventDefault();
        opts.onNewCase();
        return;
      }

      if (key === 'escape') {
        e.preventDefault();
        opts.onExit();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [opts]);
};
