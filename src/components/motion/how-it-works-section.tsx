import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

import { loadGsap } from '@/lib/lazy-gsap';

type Stage = {
  index: number;
  title: string;
  description: string;
};

const STAGES: Stage[] = [
  {
    index: 1,
    title: 'Pick a track',
    description: 'Melanoma focus, mixed lesions, or exam-style OSCEs.',
  },
  {
    index: 2,
    title: 'Review the case',
    description: 'Clinical + dermoscopic images with relevant history.',
  },
  {
    index: 3,
    title: 'Decide & justify',
    description:
      'Benign vs malignant choice, ABCDE/7-point notes, and next-step reasoning.',
  },
  {
    index: 4,
    title: 'Get feedback',
    description: 'See expert reasoning, key features, and pitfalls.',
  },
  {
    index: 5,
    title: 'Track progress',
    description: 'Accuracy trends, streaks, and calibration over time.',
  },
];

export const HowItWorksSection = () => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <StackedHowItWorks />;
  }

  return <PinnedHowItWorks />;
};

const StackedHowItWorks = () => (
  <section id="how" className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
    <div className="mb-10 text-center">
      <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
    </div>
    <ol className="space-y-6 text-sm text-neutral-700">
      {STAGES.map((stage) => (
        <li key={stage.index}>
          <span className="font-semibold">
            {stage.index}) {stage.title}.
          </span>{' '}
          {stage.description}
        </li>
      ))}
    </ol>
  </section>
);

const PinnedHowItWorks = () => {
  const containerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let scrollTriggerInstance: { kill: () => void } | null = null;
    let cancelled = false;

    loadGsap().then(({ ScrollTrigger }) => {
      if (cancelled || !triggerRef.current) return;

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: triggerRef.current,
        pin: containerRef.current ?? undefined,
        start: 'top top',
        end: `+=${STAGES.length * 400}`,
        scrub: true,
        snap: {
          snapTo: (progress) =>
            Math.round(progress * (STAGES.length - 1)) / (STAGES.length - 1),
          duration: 0.2,
        },
        onUpdate: ({ progress }) => {
          const index = Math.min(
            STAGES.length - 1,
            Math.floor(progress * STAGES.length),
          );
          setActiveStep(index);
        },
      });
    });

    return () => {
      cancelled = true;
      scrollTriggerInstance?.kill();
    };
  }, []);

  const activeStage = STAGES[activeStep];

  return (
    <section
      id="how"
      ref={containerRef}
      data-how-pinned
      className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20"
    >
      <div ref={triggerRef} className="grid items-center gap-10 md:grid-cols-2">
        <div className="mx-auto w-full max-w-sm rounded-2xl border bg-neutral-50 p-6 shadow-sm">
          <div className="text-xs font-medium text-neutral-500">
            Step {activeStage.index} of {STAGES.length}
          </div>
          <div className="mt-2 text-xl font-semibold">{activeStage.title}</div>
          <p className="mt-3 text-sm text-neutral-600">
            {activeStage.description}
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
          <ol className="mt-6 space-y-3 text-sm text-neutral-700">
            {STAGES.map((stage, i) => (
              <li
                key={stage.index}
                className={
                  i === activeStep
                    ? 'font-semibold text-foreground'
                    : 'text-neutral-500'
                }
              >
                {stage.index}) {stage.title}.{' '}
                <span className="font-normal text-neutral-600">
                  {stage.description}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
