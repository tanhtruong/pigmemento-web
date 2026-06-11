import * as React from 'react';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Hairline } from '@/components/foundation/hairline';

export type StartACaseOption = {
  id: string;
  label: string;
  /** Sub-line description. Geist Sans muted-foreground. */
  description?: string;
  /** Keyboard shortcut hint. Rendered Geist Mono, right-aligned. */
  shortcut?: string;
  onSelect: () => void;
};

type StartACasePickerProps = {
  options: StartACaseOption[];
  /** Title row above the options. */
  title?: string;
  className?: string;
};

/**
 * The Start-a-case picker — opens from the top-bar `Start a case` button
 * (cmdk-driven on desktop, vaul sheet on mobile).
 *
 * Default options:
 *   - Random
 *   - Drill: Melanoma vs Nevus
 *   - Drill: ABCDE features
 *   - Resume (if applicable)
 *
 * PR3 wires the cmdk/vaul shell. For PR1 this is the inner option list — used
 * as-is by both shells once they land.
 */
export const StartACasePicker = ({
  options,
  title = 'Start a case',
  className,
}: StartACasePickerProps) => {
  return (
    <div
      data-slot="start-a-case-picker"
      className={cn('flex flex-col gap-3', className)}
    >
      <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="flex flex-col">
        {options.map((option, i) => (
          <React.Fragment key={option.id}>
            {i > 0 && <Hairline />}
            <li>
              <button
                type="button"
                onClick={option.onSelect}
                className={cn(
                  'group/option flex w-full items-center justify-between gap-4 px-2 py-3.5',
                  'rounded-input text-left transition-colors ease-considered duration-150',
                  'hover:bg-accent focus-visible:bg-accent focus-visible:outline-none',
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {option.shortcut && (
                    <kbd className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">
                      {option.shortcut}
                    </kbd>
                  )}
                  <ArrowRight
                    className="text-muted-foreground transition-transform group-hover/option:translate-x-0.5"
                    size={16}
                    aria-hidden
                  />
                </div>
              </button>
            </li>
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};
