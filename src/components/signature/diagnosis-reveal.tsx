import { cn } from '@/lib/utils';
import { Hairline } from '@/components/foundation/hairline';

type Outcome = 'correct' | 'incorrect' | 'skipped';

type DiagnosisRevealProps = {
  /** The clinical diagnosis — the Instrument Serif moment. */
  diagnosis: string;
  /** Plain-English teaching point. Geist Sans, leading-relaxed. */
  teaching?: string;
  /** correct → mint dot · incorrect → coral dot · skipped → graphite dot. */
  outcome?: Outcome;
  /** Plain correctness sentence — never shouty. */
  outcomeCopy?: string;
  /** When false, the component renders nothing (pre-commit state). */
  visible?: boolean;
  className?: string;
};

const DOT_CLASS: Record<Outcome, string> = {
  correct: 'bg-correct',
  incorrect: 'bg-incorrect',
  skipped: 'bg-muted-foreground',
};

/**
 * The diagnosis reveal — the single Instrument Serif moment inside the app.
 *
 * For PR1 this renders the composed final state (all beats present, no
 * animation). PR5 layers in the character-stagger + sequenced reveal per
 * revealSequence in motion-tokens.ts.
 *
 * The serif appearing here — and ONLY here, inside the app — makes it a
 * meaning-marker rather than decoration.
 */
export const DiagnosisReveal = ({
  diagnosis,
  teaching,
  outcome,
  outcomeCopy,
  visible = true,
  className,
}: DiagnosisRevealProps) => {
  if (!visible) return null;
  return (
    <section
      data-slot="diagnosis-reveal"
      data-outcome={outcome}
      className={cn('flex flex-col gap-4', className)}
    >
      <Hairline />

      <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">
        Diagnosis
      </p>

      <h2 className="font-display text-4xl leading-[1.05] sm:text-5xl">
        {diagnosis}
      </h2>

      {outcome && outcomeCopy && (
        <p className="flex items-center gap-2 text-sm text-foreground">
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full',
              DOT_CLASS[outcome],
            )}
            aria-hidden
          />
          {outcomeCopy}
        </p>
      )}

      {teaching && (
        <p className="text-muted-foreground text-base leading-relaxed">
          {teaching}
        </p>
      )}
    </section>
  );
};
