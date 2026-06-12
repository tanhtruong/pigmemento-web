import { useRef } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'motion/react';
import { Sparkles, Sun, MoonStar } from 'lucide-react';

import { SoftCircleReveal } from '@/components/motion/soft-circle-reveal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';

import { GrainOverlay } from '@/components/foundation/grain-overlay';
import { AmberGlow } from '@/components/foundation/amber-glow';
import { Hairline } from '@/components/foundation/hairline';

import { StreakChip } from '@/components/signature/streak-chip';
import { AmberFAB } from '@/components/signature/amber-fab';
import { AnnotatedLesionImage } from '@/components/signature/annotated-lesion-image';
import { DiagnosisReveal } from '@/components/signature/diagnosis-reveal';
import { CalendarHeatmap } from '@/components/signature/calendar-heatmap';
import { StartACasePicker } from '@/components/signature/start-a-case-picker';

import { motionTokens } from '@/lib/motion-tokens';
import { useTransitionNavigate } from '@/components/motion/transition-conductor';
import { commitOrigin } from '@/lib/commit-origin';

const SHOWCASE_IMAGE = '/dashboard-drill-mock.png';
const LESION_IMAGE = '/ISIC_0000022.jpg';

const SIZES = [32, 120, 800] as const;

// Synthetic heatmap data — last 12 weeks, a few hot days, gaps.
const heatmapData: Record<string, number> = (() => {
  const data: Record<string, number> = {};
  const today = new Date('2026-06-11T00:00:00Z');
  for (let i = 0; i < 84; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const intensity = [0, 0, 0, 1, 2, 4, 6, 9][i % 8];
    data[iso] = intensity;
  }
  return data;
})();

const Section = ({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-6">
    <header className="flex flex-col gap-1.5">
      <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-primary uppercase">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl leading-tight">{title}</h2>
      {description && (
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      )}
    </header>
    {children}
  </section>
);

const Swatch = ({ token, label }: { token: string; label: string }) => (
  <div className="flex flex-col gap-2">
    <div
      className="h-14 w-full rounded-input border border-hairline"
      style={{ backgroundColor: `var(${token})` }}
    />
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <span className="font-mono text-[0.65rem] text-muted-foreground">
        {token}
      </span>
    </div>
  </div>
);

const ConductorTrigger = () => {
  const startTransition = useTransitionNavigate();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Button
      ref={triggerRef}
      onClick={() =>
        startTransition({
          kind: 'enter-app',
          origin: commitOrigin(triggerRef.current),
          destination: '/dev/motion',
        })
      }
    >
      Bloom enter-app
    </Button>
  );
};

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={14} /> : <MoonStar size={14} />}
      <span className="ml-1.5 font-mono text-[0.7rem] tracking-wider uppercase">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </Button>
  );
};

const DevMotionRoute = () => {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      <GrainOverlay intensity={1.4} />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-20 px-5 py-16 md:py-24">
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="mono">PR1 · Foundation</Badge>
            <div className="flex items-center gap-2">
              <StreakChip value={7} />
              <ThemeToggle />
            </div>
          </div>
          <div className="relative flex flex-col gap-4">
            <AmberGlow
              variant="full"
              size="lg"
              className="-top-20 -left-20 -z-10 opacity-70"
            />
            <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
              Pigmemento · Design system foundation
            </p>
            <h1 className="font-display max-w-3xl text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
              Pattern recognition,
              <br />
              <span className="italic">case by case.</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Visual QA surface for the redesign foundation. Every token,
              primitive, and signature component lands here first. Toggle the
              theme to compare the dark landing voice with the light app voice.
            </p>
          </div>
        </header>

        <Hairline />

        {/* TYPOGRAPHY ----------------------------------------------------- */}
        <Section
          eyebrow="01 · Typography"
          title="Three faces, one voice."
          description="Instrument Serif for meaning. Geist Sans for prose. Geist Mono for measurements."
        >
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                Display · Instrument Serif
              </p>
              <p className="font-display text-6xl leading-[1.02] tracking-tight">
                Could you spot it?
              </p>
              <p className="font-display text-3xl leading-tight italic">
                The 90 seconds that compound.
              </p>
            </div>
            <Hairline />
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                Body · Geist Sans
              </p>
              <p className="max-w-2xl text-base leading-relaxed">
                Real dermoscopic cases, scored answers, and the teaching that
                turns &ldquo;looks suspicious&rdquo; into &ldquo;I know the
                pattern.&rdquo;
              </p>
              <p className="max-w-2xl text-sm text-muted-foreground">
                The same family at smaller weights carries every interface
                surface — choices, context, dashboards.
              </p>
            </div>
            <Hairline />
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                Data · Geist Mono
              </p>
              <p className="font-mono text-base tabular-nums">
                ISIC_0000022 · MELANOMA · COURTESY ISIC ARCHIVE
              </p>
              <p className="font-mono text-2xl tabular-nums">
                03 / 12 · 91% · 142 cases
              </p>
            </div>
          </div>
        </Section>

        <Hairline />

        {/* COLOR --------------------------------------------------------- */}
        <Section
          eyebrow="02 · Palette"
          title="Burnt amber on graphite or bone."
          description="A single accent does double duty. Toggle the theme to see both surfaces breathe."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
            <Swatch token="--background" label="background" />
            <Swatch token="--foreground" label="foreground" />
            <Swatch token="--card" label="card" />
            <Swatch token="--primary" label="primary · amber" />
            <Swatch token="--muted" label="muted" />
            <Swatch token="--muted-foreground" label="muted-fg" />
            <Swatch token="--accent" label="accent" />
            <Swatch token="--border" label="border" />
            <Swatch token="--hairline" label="hairline" />
            <Swatch token="--correct" label="correct · mint" />
            <Swatch token="--incorrect" label="incorrect · coral" />
            <Swatch token="--destructive" label="destructive" />
          </div>
        </Section>

        <Hairline />

        {/* BUTTONS ------------------------------------------------------- */}
        <Section
          eyebrow="03 · Buttons"
          title="Tap, lift, glow."
          description="Amber primary leads. Hairline outline and ghost handle quieter moments."
        >
          <div className="flex flex-wrap gap-3">
            <Button>Start a case</Button>
            <Button variant="outline">See how it works</Button>
            <Button variant="ghost">Skip</Button>
            <Button variant="secondary">Save case</Button>
            <Button variant="destructive">Discard attempt</Button>
            <Button variant="link">Read the PRD</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Sparkle">
              <Sparkles />
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Hairline />

        {/* CARDS + BADGES ------------------------------------------------ */}
        <Section
          eyebrow="04 · Cards + badges"
          title="Warm shadows. Hairline borders. Dampened states."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Badge variant="mono">ISIC_0000022</Badge>
                <CardTitle>Real dermoscopic cases</CardTitle>
                <CardDescription>
                  Curated from the ISIC Archive, not stock photos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="correct">Correct</Badge>
                  <Badge variant="incorrect">Incorrect</Badge>
                  <Badge variant="outline">Skipped</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Badge variant="mono">ISIC_0001345</Badge>
                <CardTitle>Feedback that teaches</CardTitle>
                <CardDescription>
                  Every answer comes with the pattern reasoning — not just right
                  or wrong.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input placeholder="Search cases…" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Badge variant="mono">ISIC_0002187</Badge>
                <CardTitle>Respects your time</CardTitle>
                <CardDescription>
                  90-second drills. Sessions that fit a coffee break.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Spinner size="sm" variant="amber" />
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    03 / 12
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Hairline />

        {/* MOTION -------------------------------------------------------- */}
        <Section
          eyebrow="05 · Motion"
          title="Spring, not bounce."
          description="Tap-lift on choice cards. The house ease is cubic-bezier(0.2, 0.8, 0.2, 1)."
        >
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileTap={{ scale: 0.97, y: -2 }}
              transition={motionTokens.tapLift}
              className="rounded-card border border-hairline bg-card px-6 py-5 text-sm font-medium text-card-foreground shadow-warm"
            >
              Benign
              <kbd className="ml-3 rounded border border-hairline px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">
                B
              </kbd>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97, y: -2 }}
              transition={motionTokens.tapLift}
              className="rounded-card border border-hairline bg-card px-6 py-5 text-sm font-medium text-card-foreground shadow-warm"
            >
              Malignant
              <kbd className="ml-3 rounded border border-hairline px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">
                M
              </kbd>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97, y: -2 }}
              transition={motionTokens.tapLift}
              className="rounded-card border border-hairline bg-card px-6 py-5 text-sm font-medium text-card-foreground shadow-warm"
            >
              Skip
              <kbd className="ml-3 rounded border border-hairline px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">
                S
              </kbd>
            </motion.button>
          </div>
        </Section>

        <Hairline />

        {/* SURFACE PRIMITIVES -------------------------------------------- */}
        <Section
          eyebrow="06 · Surfaces"
          title="Texture is the secret sauce."
          description="Film grain on dark. Paper grain on light. Amber glow only where it earns."
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="relative isolate flex h-64 items-center justify-center overflow-hidden rounded-card border border-hairline bg-card shadow-warm">
              <GrainOverlay intensity={2} scope="panel" />
              <AmberGlow size="md" variant="full" />
              <p className="relative font-display text-3xl">
                Amber glow · full
              </p>
            </div>
            <div className="relative isolate flex h-64 items-center justify-center overflow-hidden rounded-card border border-hairline bg-card shadow-warm">
              <GrainOverlay intensity={2} scope="panel" seed={11} />
              <AmberGlow size="md" variant="soft" />
              <p className="relative font-display text-3xl">
                Amber glow · soft
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </Section>

        <Hairline />

        {/* SIGNATURE COMPONENTS ----------------------------------------- */}
        <Section
          eyebrow="07 · Signature"
          title="The pieces that carry the brand."
          description="Scaffolded for PR1. Each lands real motion + interactions in its assigned PR."
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <p className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                AnnotatedLesionImage
              </p>
              <AnnotatedLesionImage
                src={LESION_IMAGE}
                alt="Dermoscopic image of a pigmented lesion"
                aspect="4:5"
                sourceCredit="ISIC_0000022 · MELANOMA · COURTESY ISIC ARCHIVE"
                features={[
                  {
                    letter: 'A',
                    centerPoint: [0.3, 0.4],
                    reasoning: 'Asymmetric across the long axis',
                  },
                  {
                    letter: 'B',
                    centerPoint: [0.62, 0.55],
                    reasoning: 'Irregular border on the medial edge',
                  },
                  {
                    letter: 'C',
                    centerPoint: [0.5, 0.35],
                    reasoning: 'Multiple colors within the lesion',
                  },
                ]}
              />
            </div>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <p className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                  DiagnosisReveal
                </p>
                <DiagnosisReveal
                  diagnosis="Melanoma"
                  outcome="incorrect"
                  outcomeCopy="You said benign. The answer is malignant."
                  teaching="Look at how the color shifts left-to-right — that asymmetry is one of the strongest signals here, paired with the irregular medial border."
                />
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                  StreakChip
                </p>
                <div className="flex items-center gap-3">
                  <StreakChip value={7} />
                  <StreakChip value={31} punching />
                  <span className="text-xs text-muted-foreground">
                    Static · punching (amber halo)
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                  StartACasePicker
                </p>
                <Card>
                  <CardContent>
                    <StartACasePicker
                      options={[
                        {
                          id: 'random',
                          label: 'Random case',
                          description: 'A case from your library at random.',
                          shortcut: 'R',
                          onSelect: () => {},
                        },
                        {
                          id: 'drill-mvn',
                          label: 'Drill · Melanoma vs Nevus',
                          description: '12 cases. ~9 minutes.',
                          shortcut: '1',
                          onSelect: () => {},
                        },
                        {
                          id: 'drill-abcde',
                          label: 'Drill · ABCDE features',
                          description: '15 cases. ~12 minutes.',
                          shortcut: '2',
                          onSelect: () => {},
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
              CalendarHeatmap
            </p>
            <Card>
              <CardContent className="flex flex-col gap-3 py-4">
                <div className="flex items-end justify-between">
                  <p className="text-sm text-muted-foreground">
                    Last 12 weeks · 142 cases · 17 active days
                  </p>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    Today
                  </span>
                </div>
                <CalendarHeatmap data={heatmapData} endDateIso="2026-06-11" />
              </CardContent>
            </Card>
          </div>
        </Section>

        <Hairline />

        {/* TRANSITION CONDUCTOR ------------------------------------------ */}
        <Section
          eyebrow="09 · TransitionConductor"
          title="The darkroom lamp."
          description="Amber bloom from the commit point, hold while the route swaps, settle into bone-warm daylight. Routes back to this page so the full sequence runs without auth."
        >
          <div className="flex flex-wrap items-center gap-4">
            <ConductorTrigger />
            <span className="text-xs text-muted-foreground">
              enter-app · bloom → hold → paper settle → dissolve
            </span>
          </div>
        </Section>

        <Hairline />

        {/* EXISTING — SoftCircleReveal -------------------------------------- */}
        <Section
          eyebrow="08 · Legacy primitives"
          title="SoftCircleReveal."
          description="Existing motion primitive, preserved. Will be folded into AnnotatedLesionImage in a later PR."
        >
          <div className="flex flex-col gap-10">
            <div>
              <p className="mb-3 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                ring-fill
              </p>
              <div className="flex flex-wrap items-end gap-8">
                {SIZES.map((size) => (
                  <div key={size} className="flex flex-col items-center gap-2">
                    <SoftCircleReveal
                      configuration="ring-fill"
                      percentage={72}
                      size={size}
                    />
                    <span className="font-mono text-xs text-muted-foreground">
                      {size}px
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 font-mono text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                silent · interactive
              </p>
              <p className="mb-3 text-sm text-muted-foreground">
                Focus the mask and use ←/→ to move it.
              </p>
              <SoftCircleReveal
                configuration="silent"
                imageSrc={SHOWCASE_IMAGE}
                imageAlt="Showcase lesion"
                size={480}
                interactive
              />
            </div>
          </div>
        </Section>
      </div>

      {/* The AmberFAB is mobile-only (md:hidden) — resize to verify it. */}
      <AmberFAB onClick={() => {}} />
    </div>
  );
};

export default DevMotionRoute;
