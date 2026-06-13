import { ArrowRight, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Hairline } from '@/components/foundation/hairline';
import { DiagnosisReveal } from '@/components/signature/diagnosis-reveal';

type Outcome = 'correct' | 'incorrect' | 'skipped';

type CaseVerdictProps = {
  /** The clinical diagnosis — the Instrument Serif moment. */
  diagnosis: string;
  outcome: Outcome;
  outcomeCopy: string;
  teaching: string;
  /**
   * A live commit plays the reveal sequence; a cold-restored verdict (refresh,
   * already-answered re-entry) composes in place with no animation.
   */
  animate?: boolean;
  /** Load the next case. */
  onNext: () => void;
  /** Re-ask this same case (client-only — the prior attempt still stands). */
  onRetry: () => void;
  /** Leave the case for the Library. */
  onLibrary: () => void;
};

/**
 * The verdict — the working column once a case is answered (#85). It is the
 * former `/review` surface's right column, now rendered in place on the attempt
 * scene: the lesion hero never moved, so the diagnosis reads as resolving where
 * the question stood rather than on a separate page.
 */
export const CaseVerdict = ({
  diagnosis,
  outcome,
  outcomeCopy,
  teaching,
  animate = true,
  onNext,
  onRetry,
  onLibrary,
}: CaseVerdictProps) => (
  <>
    <DiagnosisReveal
      diagnosis={diagnosis}
      outcome={outcome}
      outcomeCopy={outcomeCopy}
      teaching={teaching}
      animate={animate}
    />

    <Hairline />

    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
        Next steps
      </p>
      <div className="flex flex-col gap-2">
        <Button onClick={onNext} className="w-full sm:w-fit">
          Next case
          <ArrowRight />
        </Button>
        <Button variant="outline" onClick={onRetry} className="w-full sm:w-fit">
          <RotateCcw />
          Try this case again
        </Button>
        <Button variant="ghost" onClick={onLibrary} className="w-full sm:w-fit">
          ← Back to Library
        </Button>
      </div>
      <p className="text-muted-foreground mt-2 text-[0.6875rem]">
        Shortcuts: <kbd className="font-mono">Enter</kbd> next ·{' '}
        <kbd className="font-mono">R</kbd> retry ·{' '}
        <kbd className="font-mono">L</kbd> library
      </p>
    </div>

    <p className="text-muted-foreground text-[0.6875rem]">
      Educational use only — not for diagnosis.
    </p>
  </>
);
