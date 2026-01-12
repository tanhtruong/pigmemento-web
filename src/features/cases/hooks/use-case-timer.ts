// Reusable timer hook for case attempts
import { useEffect, useMemo, useRef, useState } from 'react';

export const useCaseTimer = (deps: any[] = []) => {
  const startedAtRef = useRef<number>(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    startedAtRef.current = performance.now();
    setElapsedMs(0);

    const interval = window.setInterval(() => {
      setElapsedMs(Math.max(0, performance.now() - startedAtRef.current));
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, deps);

  const elapsedLabel = useMemo(() => {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }, [elapsedMs]);

  const getElapsedMs = () =>
    Math.max(0, Math.round(performance.now() - startedAtRef.current));

  return { elapsedMs, elapsedLabel, getElapsedMs };
};
