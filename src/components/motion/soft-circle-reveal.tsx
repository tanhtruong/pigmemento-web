import { useState, type CSSProperties, type KeyboardEvent } from 'react';
import { useReducedMotion } from 'motion/react';

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

type SilentRevealInternalProps = SilentProps & {
  boxStyle: CSSProperties;
};

const SilentReveal = ({
  imageSrc,
  imageAlt,
  interactive: requestedInteractive,
  boxStyle,
}: SilentRevealInternalProps) => {
  const reducedMotion = useReducedMotion();
  const interactive = (requestedInteractive ?? false) && !reducedMotion;
  const [position, setPosition] = useState(INITIAL_POSITION);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setPosition((current) => clamp(current + KEYBOARD_STEP));
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setPosition((current) => clamp(current - KEYBOARD_STEP));
    }
  };

  const mask = interactive ? (
    <div
      data-testid="soft-circle-mask"
      role="slider"
      aria-label="Reveal position"
      aria-valuenow={position}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ ...STATIC_MASK_STYLE, pointerEvents: 'auto' }}
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
