import { SoftCircleReveal } from '@/components/motion/soft-circle-reveal';

const SHOWCASE_IMAGE = '/dashboard-drill-mock.png';

const SIZES = [32, 120, 800] as const;

const DevMotionRoute = () => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">
      <header>
        <h1 className="text-2xl font-bold">Motion primitives</h1>
        <p className="text-muted-foreground text-sm">
          Visual QA surface for <code>SoftCircleReveal</code>. Not linked from
          navigation.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">ring-fill</h2>
        <div className="flex flex-wrap items-end gap-8">
          {SIZES.map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <SoftCircleReveal
                configuration="ring-fill"
                percentage={72}
                size={size}
              />
              <span className="text-muted-foreground text-xs">{size}px</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">silent (interactive)</h2>
        <p className="text-muted-foreground text-sm">
          Focus the mask and use ←/→ to move it.
        </p>
        <SoftCircleReveal
          configuration="silent"
          imageSrc={SHOWCASE_IMAGE}
          imageAlt="Showcase lesion"
          size={480}
          interactive
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">annotated</h2>
        <SoftCircleReveal
          configuration="annotated"
          imageSrc={SHOWCASE_IMAGE}
          imageAlt="Annotated lesion"
          size={480}
          features={[
            {
              letter: 'A',
              centerPoint: [0.3, 0.45],
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
      </section>
    </div>
  );
};

export default DevMotionRoute;
