import {
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { animate, useReducedMotion } from 'motion/react';

export type AbcdeFeature = {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  centerPoint: [number, number];
  reasoning: string;
};

type RingFillProps = {
  configuration: 'ring-fill';
  percentage: number;
  size?: number;
};

type SilentProps = {
  configuration: 'silent';
  imageSrc: string;
  imageAlt: string;
  size?: number;
  interactive?: boolean;
  autoplay?: boolean;
};

type AnnotatedProps = {
  configuration: 'annotated';
  imageSrc: string;
  imageAlt: string;
  size?: number;
  features: AbcdeFeature[];
};

type SoftCircleRevealProps = RingFillProps | SilentProps | AnnotatedProps;

const DEFAULT_SIZE = 800;
const KEYBOARD_STEP = 5;
const INITIAL_POSITION = 50;
const AUTOPLAY_SWEEP_S = 0.48;
const AUTOPLAY_SETTLE_S = 0.24;
const SOFT_CIRCLE_EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

const clamp = (value: number) => Math.max(0, Math.min(100, value));

const boxStyleFor = (size: number): CSSProperties => ({
  width: `${size}px`,
  height: `${size}px`,
});

export const SoftCircleReveal = (props: SoftCircleRevealProps) => {
  const size = props.size ?? DEFAULT_SIZE;
  const boxStyle = boxStyleFor(size);

  if (props.configuration === 'ring-fill') {
    return (
      <div
        role="progressbar"
        aria-valuenow={props.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        style={boxStyle}
      />
    );
  }

  if (props.configuration === 'silent') {
    return <SilentReveal {...props} boxStyle={boxStyle} />;
  }

  return <AnnotatedReveal {...props} boxStyle={boxStyle} />;
};

type RevealLayoutProps = {
  imageSrc: string;
  imageAlt: string;
  boxStyle: CSSProperties;
  mask: React.ReactNode;
  overlays?: React.ReactNode;
};

const RevealLayout = ({
  imageSrc,
  imageAlt,
  boxStyle,
  mask,
  overlays,
}: RevealLayoutProps) => (
  <div style={{ ...boxStyle, position: 'relative' }}>
    <img
      src={imageSrc}
      alt={imageAlt}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
    {mask}
    {overlays}
  </div>
);

const STATIC_MASK_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
};

const StaticMask = () => (
  <div
    data-testid="soft-circle-mask"
    aria-hidden="true"
    style={STATIC_MASK_STYLE}
  />
);

const visibleMarkStyle = (position: number): CSSProperties => ({
  position: 'absolute',
  left: `${position}%`,
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '30%',
  aspectRatio: '1 / 1',
  borderRadius: '50%',
  border: '1px solid color-mix(in oklch, var(--primary) 35%, transparent)',
  boxShadow:
    '0 0 0 4px color-mix(in oklch, var(--primary) 8%, transparent), inset 0 0 24px color-mix(in oklch, var(--primary) 6%, transparent)',
  pointerEvents: 'none',
});

type SilentRevealInternalProps = SilentProps & {
  boxStyle: CSSProperties;
};

const SilentReveal = ({
  imageSrc,
  imageAlt,
  interactive: requestedInteractive,
  autoplay = false,
  boxStyle,
}: SilentRevealInternalProps) => {
  const reducedMotion = useReducedMotion();
  const interactive = (requestedInteractive ?? false) && !reducedMotion;
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (reducedMotion || !autoplay) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- seeds the autoplay sweep's start position before motion's animate() drives it imperatively
    setPosition(0);
    let settleRef: ReturnType<typeof animate> | null = null;
    const sweep = animate(0, 100, {
      duration: AUTOPLAY_SWEEP_S,
      ease: SOFT_CIRCLE_EASE,
      onUpdate: setPosition,
      onComplete: () => {
        settleRef = animate(100, INITIAL_POSITION, {
          duration: AUTOPLAY_SETTLE_S,
          ease: SOFT_CIRCLE_EASE,
          onUpdate: setPosition,
        });
      },
    });

    return () => {
      sweep.stop();
      settleRef?.stop();
    };
  }, [autoplay, reducedMotion]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setPosition((current) => clamp(current + KEYBOARD_STEP));
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setPosition((current) => clamp(current - KEYBOARD_STEP));
    }
  };

  const updateFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const x = event.clientX - rect.left;
    setPosition(clamp((x / rect.width) * 100));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    updateFromPointer(event);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateFromPointer(event);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  };

  const roundedPosition = Math.round(position);

  const mask = interactive ? (
    <div
      data-testid="soft-circle-mask"
      role="slider"
      aria-label="Reveal position"
      aria-valuenow={roundedPosition}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        ...STATIC_MASK_STYLE,
        pointerEvents: 'auto',
        cursor: dragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
    />
  ) : (
    <StaticMask />
  );

  return (
    <RevealLayout
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      boxStyle={boxStyle}
      mask={mask}
      overlays={<div aria-hidden="true" style={visibleMarkStyle(position)} />}
    />
  );
};

type AnnotatedRevealInternalProps = AnnotatedProps & {
  boxStyle: CSSProperties;
};

const AnnotatedReveal = ({
  imageSrc,
  imageAlt,
  features,
  boxStyle,
}: AnnotatedRevealInternalProps) => {
  const markers = features.map((feature) => (
    <div
      key={feature.letter}
      aria-label={`${feature.letter} — ${feature.reasoning}`}
      style={{
        position: 'absolute',
        left: `${feature.centerPoint[0] * 100}%`,
        top: `${feature.centerPoint[1] * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {feature.letter}
    </div>
  ));

  return (
    <RevealLayout
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      boxStyle={boxStyle}
      mask={<StaticMask />}
      overlays={markers}
    />
  );
};
