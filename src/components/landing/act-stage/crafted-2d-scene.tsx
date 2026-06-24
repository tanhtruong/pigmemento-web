import { type RefObject, useEffect, useRef } from 'react';

import type { AbcdeFeature } from '@/types/abcde-feature';
import {
  exposureAt,
  rakeLightAt,
  READING_END,
  READING_START,
} from './act-beats';
import { pinReveal } from '../case-stage/pin-layout';

const SCALE = '#9a958c';
const BONE = '#ede8df';
const VEIL = '#7e94a6';

const READOUT: Record<AbcdeFeature['letter'], string> = {
  A: 'axis 7.2 mm',
  B: 'notch 0.6 mm',
  C: '4 hues',
  D: 'Ø 7.8 mm',
  E: 'Δ ~90 d',
};

type Crafted2DSceneProps = {
  imageSrc: string;
  features: AbcdeFeature[];
  scrollProgressRef: RefObject<number>;
  /** Reduced-motion / no-scrub: render the composed final state, no rAF. */
  staticMode: boolean;
};

/**
 * The crafted 2D fallback (#148) — the same Act I beats and reading reveal as
 * the WebGL scene, without the shader, for phones / no-WebGL2 / perf-degrade.
 * The raking light is a CSS sheen swept by the scroll-driven light azimuth; the
 * exposure is a brightness ramp; the graticule + ABCDE crosshairs are SVG. A
 * rAF loop reads the shared scroll-progress ref (mirroring the WebGL useFrame).
 * Under reduced-motion it composes the final state once and never scrubs.
 *
 * No three / no GSAP here — this is the universal path the static-first floor
 * upgrades to when the cinematic take can't run.
 */
export default function Crafted2DScene({
  imageSrc,
  features,
  scrollProgressRef,
  staticMode,
}: Crafted2DSceneProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const apply = (p: number) => {
      const exposure = exposureAt(p);
      const [azimuth] = rakeLightAt(p);
      const img = imgRef.current;
      if (img) {
        img.style.filter = `brightness(${(0.55 + exposure * 0.5).toFixed(3)}) contrast(1.07) saturate(1.02)`;
        img.style.transform = `scale(${(1.04 + p * 0.06).toFixed(3)})`;
      }
      const sheen = sheenRef.current;
      if (sheen) {
        sheen.style.transform = `translateX(${(azimuth * 32).toFixed(2)}%)`;
        sheen.style.opacity = (0.5 * exposure).toFixed(3);
      }
      const dim = dimRef.current;
      if (dim) dim.style.opacity = ((1 - exposure) * 0.62).toFixed(3);
      for (let i = 0; i < features.length; i++) {
        const reveal = pinReveal(
          i,
          features.length,
          p,
          READING_START,
          READING_END,
        );
        const el = featureRefs.current[i];
        if (el) el.style.opacity = reveal.toFixed(3);
      }
    };

    if (staticMode) {
      apply(1);
      return;
    }
    let raf = 0;
    const loop = () => {
      apply(scrollProgressRef.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [staticMode, scrollProgressRef, features]);

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#0b0a09',
      }}
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.5) contrast(1.06)',
          transform: 'scale(1.04)',
          willChange: 'filter, transform',
        }}
      />
      <div
        ref={sheenRef}
        style={{
          position: 'absolute',
          inset: '-20%',
          background:
            'radial-gradient(60% 50% at 50% 45%, rgba(255,248,236,0.9), rgba(255,248,236,0) 70%)',
          mixBlendMode: 'soft-light',
          opacity: 0,
          pointerEvents: 'none',
          willChange: 'transform, opacity',
        }}
      />
      <div
        ref={dimRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0b0a09',
          opacity: 0.5,
          pointerEvents: 'none',
          willChange: 'opacity',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(120% 90% at 50% 50%, rgba(11,10,9,0) 52%, rgba(11,10,9,0.62) 100%)',
          pointerEvents: 'none',
        }}
      />
      <svg
        viewBox="0 0 100 125"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <circle
          cx="50"
          cy="62.5"
          r="46"
          fill="none"
          stroke={SCALE}
          strokeWidth="0.2"
          opacity="0.16"
        />
        <line
          x1="44"
          y1="62.5"
          x2="48.5"
          y2="62.5"
          stroke={SCALE}
          strokeWidth="0.2"
          opacity="0.4"
        />
        <line
          x1="51.5"
          y1="62.5"
          x2="56"
          y2="62.5"
          stroke={SCALE}
          strokeWidth="0.2"
          opacity="0.4"
        />
        <line
          x1="50"
          y1="56.5"
          x2="50"
          y2="61"
          stroke={SCALE}
          strokeWidth="0.2"
          opacity="0.4"
        />
        <line
          x1="50"
          y1="64"
          x2="50"
          y2="68.5"
          stroke={SCALE}
          strokeWidth="0.2"
          opacity="0.4"
        />
        <g opacity="0.5">
          <line
            x1="38"
            y1="118"
            x2="62"
            y2="118"
            stroke={SCALE}
            strokeWidth="0.2"
          />
          <line
            x1="38"
            y1="116.6"
            x2="38"
            y2="119.4"
            stroke={SCALE}
            strokeWidth="0.2"
          />
          <line
            x1="62"
            y1="116.6"
            x2="62"
            y2="119.4"
            stroke={SCALE}
            strokeWidth="0.2"
          />
          <text
            x="50"
            y="115"
            fill={SCALE}
            fontSize="2.4"
            fontFamily="ui-monospace, monospace"
            textAnchor="middle"
            letterSpacing="0.2"
          >
            5 mm
          </text>
        </g>
        {features.map((feature, i) => {
          const cx = feature.centerPoint[0] * 100;
          const cy = feature.centerPoint[1] * 125;
          return (
            <g
              key={feature.letter}
              opacity="0"
              ref={(el) => {
                featureRefs.current[i] = el;
              }}
            >
              <circle
                cx={cx}
                cy={cy}
                r="2.6"
                fill="none"
                stroke={VEIL}
                strokeWidth="0.3"
              />
              <line
                x1={cx - 4}
                y1={cy}
                x2={cx - 1.6}
                y2={cy}
                stroke={VEIL}
                strokeWidth="0.3"
              />
              <line
                x1={cx + 1.6}
                y1={cy}
                x2={cx + 4}
                y2={cy}
                stroke={VEIL}
                strokeWidth="0.3"
              />
              <line
                x1={cx}
                y1={cy - 4}
                x2={cx}
                y2={cy - 1.6}
                stroke={VEIL}
                strokeWidth="0.3"
              />
              <line
                x1={cx}
                y1={cy + 1.6}
                x2={cx}
                y2={cy + 4}
                stroke={VEIL}
                strokeWidth="0.3"
              />
              <text
                x={cx + 5.5}
                y={cy + 1}
                fill={VEIL}
                fontSize="2.6"
                fontFamily="ui-monospace, monospace"
                fontWeight="600"
              >
                {feature.letter}
              </text>
              <text
                x={cx + 9}
                y={cy + 1}
                fill={BONE}
                fontSize="2.4"
                fontFamily="ui-monospace, monospace"
                opacity="0.85"
              >
                {READOUT[feature.letter]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
