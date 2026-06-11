import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';

type NumberTickerProps = {
  value: number;
  formatValue?: (n: number) => string;
};

const defaultFormat = (n: number) => String(n);
const TICKER_DURATION_SECONDS = 0.6;

export const NumberTicker = ({
  value,
  formatValue = defaultFormat,
}: NumberTickerProps) => {
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    const controls = animate(0, value, {
      duration: TICKER_DURATION_SECONDS,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (latest) => setProgress(latest),
    });

    return () => controls.stop();
  }, [value, reducedMotion]);

  const formatted = formatValue(value);
  const visible = formatValue(reducedMotion ? value : Math.round(progress));

  return (
    <span aria-label={formatted}>
      <span aria-hidden="true">{visible}</span>
    </span>
  );
};
