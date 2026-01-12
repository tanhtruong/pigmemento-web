import { useEffect } from 'react';

export const useCaseAttemptShortcuts = (opts: {
  enabled: boolean;
  canSubmit: boolean;
  isPending: boolean;
  onSelectBenign: () => void;
  onSelectMalignant: () => void;
  onSubmit: () => void;
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
      (node as any).isContentEditable
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
        if (!opts.isPending) opts.onSelectBenign();
        return;
      }

      if (key === 'm') {
        e.preventDefault();
        if (!opts.isPending) opts.onSelectMalignant();
        return;
      }

      if (key === 'enter') {
        if (!opts.canSubmit) return;
        e.preventDefault();
        if (!opts.isPending) opts.onSubmit();
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
