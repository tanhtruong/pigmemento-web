import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Html,
  PerformanceMonitor,
  Sparkles,
  useTexture,
} from '@react-three/drei';
import { type RefObject, Suspense, useRef, useState } from 'react';
import * as THREE from 'three';

import type { AbcdeFeature } from '@/features/cases/types/abcde-feature';
import { cameraPositionAt } from './camera-beats';
import { pinPositionFromCenter, pinReveal } from './pin-layout';

type R3fSceneProps = {
  imageSrc: string;
  /** Run the render loop only while true (tab visible + canvas on-screen). */
  active: boolean;
  /** Page scroll progress (0–1) driving the camera dolly — see camera-beats. */
  scrollProgressRef: RefObject<number>;
  /** ABCDE annotations pinned onto the specimen, revealed on the close-up beat. */
  features?: AbcdeFeature[];
  /** Called when adaptive quality can't hold the perf floor — bail to static (#132). */
  onDegrade?: () => void;
  className?: string;
};

// Adaptive-quality ladder (#132): step DPR ceiling + ambient particle count down
// together on sustained frame-rate decline, restore on recovery. If quality keeps
// flip-flopping (can't stabilise even at the floor), PerformanceMonitor's
// onFallback bails the whole scene to the static layer.
const QUALITY = {
  high: { dpr: 1.5, sparkles: 36 },
  low: { dpr: 1, sparkles: 18 },
} as const;

const PARALLAX = 0.12;

/**
 * The "specimen on the stage" (#125): a flat case-image plane on a softly-lit
 * slide, with a restrained ambient "dermoscopy field" (drei <Sparkles>) and fog
 * for atmospheric depth. The dermoscopy plane stays an honest flat 2D image —
 * we never fake topology on a melanoma. A scroll-driven camera dollies through
 * four framings (#130) and ABCDE pins reveal off the surface during the
 * close-up beat (#131).
 *
 * Decorative + `aria-hidden`: the real, accessible, indexable content is the
 * static AnnotatedLesionImage underneath — including its ABCDE labels, so the
 * pin labels here stay decorative DOM. Lazy-loaded so three/r3f/drei stay in
 * the quarantined async chunk enforced by the bundle guard (#126).
 */
export default function R3fScene({
  imageSrc,
  active,
  scrollProgressRef,
  features,
  onDegrade,
  className,
}: R3fSceneProps) {
  const [tier, setTier] = useState<keyof typeof QUALITY>('high');
  const quality = QUALITY[tier];

  return (
    <Canvas
      className={className}
      aria-hidden
      frameloop={active ? 'always' : 'never'}
      dpr={[1, quality.dpr]}
      camera={{ position: cameraPositionAt(0), fov: 38 }}
      gl={{ antialias: true }}
    >
      <PerformanceMonitor
        onDecline={() => setTier('low')}
        onIncline={() => setTier('high')}
        flipflops={3}
        onFallback={() => onDegrade?.()}
      />
      <CameraRig scrollProgressRef={scrollProgressRef} />
      <color attach="background" args={['#0a0a0b']} />
      <fog attach="fog" args={['#0a0a0b', 4.2, 9]} />
      <ambientLight intensity={0.7} />
      <spotLight
        position={[2.5, 3.5, 4]}
        angle={0.5}
        penumbra={1}
        intensity={1.4}
      />
      <Suspense fallback={null}>
        <Specimen
          imageSrc={imageSrc}
          features={features}
          scrollProgressRef={scrollProgressRef}
        />
      </Suspense>
      <Sparkles
        count={quality.sparkles}
        scale={[5, 6, 2.5]}
        size={2}
        speed={0.25}
        opacity={0.35}
        color="#ff9a6a"
      />
    </Canvas>
  );
}

/**
 * Eases the camera toward the scroll-mapped framing each frame. Only runs while
 * the loop is active (on-screen + visible); paused off-screen, so the camera
 * holds. The initial Canvas camera sits at the wide framing, so reduced-motion /
 * static (which never scrub) match the entry beat.
 */
function CameraRig({
  scrollProgressRef,
}: {
  scrollProgressRef: RefObject<number>;
}) {
  const camera = useThree((state) => state.camera);
  const target = useRef(new THREE.Vector3(...cameraPositionAt(0)));

  useFrame(() => {
    const [x, y, z] = cameraPositionAt(scrollProgressRef.current);
    target.current.set(x, y, z);
    camera.position.lerp(target.current, 0.08);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Specimen({
  imageSrc,
  features,
  scrollProgressRef,
}: {
  imageSrc: string;
  features?: AbcdeFeature[];
  scrollProgressRef: RefObject<number>;
}) {
  const texture = useTexture(imageSrc);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    // Pointer parallax — ease the stage tilt toward the cursor.
    const targetX = -state.pointer.y * PARALLAX;
    const targetY = state.pointer.x * PARALLAX;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetX, 0.06);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetY, 0.06);
  });

  return (
    <group ref={groupRef}>
      {/* Softly-lit slide backing the specimen. */}
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[2.5, 3.05]} />
        <meshStandardMaterial color="#141418" roughness={0.85} metalness={0} />
      </mesh>
      {/* The flat case plane — honest 2D dermoscopy. */}
      <mesh>
        <planeGeometry args={[2.1, 2.6]} />
        <meshStandardMaterial map={texture} roughness={0.65} metalness={0} />
      </mesh>
      {/* ABCDE pins live inside the tilting group, so they parallax off the
          plane with the pointer and the camera dolly. */}
      {features && features.length > 0 && (
        <AbcdePins features={features} scrollProgressRef={scrollProgressRef} />
      )}
    </group>
  );
}

/**
 * Five ABCDE pins floating off the lesion surface, revealed one at a time as
 * the camera holds the close-up beat (#131). Each pin is a hairline amber ring
 * (echoing the static annotation circles) plus a DOM reasoning label (drei
 * `<Html>`) anchored to the pin's projected screen position. Reveal is driven
 * imperatively from `scrollProgressRef` in useFrame — no per-frame React render.
 *
 * The labels are `aria-hidden` decorative DOM: the accessible + indexable ABCDE
 * text is the static AnnotatedLesionImage list beneath the canvas, and these
 * reuse the same `feature.reasoning` so the teaching content can't drift.
 */
function AbcdePins({
  features,
  scrollProgressRef,
}: {
  features: AbcdeFeature[];
  scrollProgressRef: RefObject<number>;
}) {
  const pinRefs = useRef<(THREE.Group | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useFrame(() => {
    const progress = scrollProgressRef.current;
    for (let i = 0; i < features.length; i++) {
      const reveal = pinReveal(i, features.length, progress);
      const pin = pinRefs.current[i];
      if (pin) pin.scale.setScalar(reveal);
      const label = labelRefs.current[i];
      if (label) label.style.opacity = String(reveal);
    }
  });

  return (
    <>
      {features.map((feature, i) => (
        <group
          key={feature.letter}
          position={pinPositionFromCenter(feature.centerPoint)}
          scale={0}
          ref={(el) => {
            pinRefs.current[i] = el;
          }}
        >
          <mesh>
            <ringGeometry args={[0.05, 0.066, 40]} />
            <meshBasicMaterial
              color="#ff9a6a"
              transparent
              opacity={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Html position={[0.14, 0.1, 0]} center pointerEvents="none">
            <div
              aria-hidden
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              style={{ opacity: 0 }}
              className="border-hairline bg-background/80 flex items-baseline gap-1.5 rounded-full border px-2 py-0.5 whitespace-nowrap backdrop-blur-sm"
            >
              <span className="text-primary font-mono text-[0.7rem] tabular-nums">
                {feature.letter}
              </span>
              <span className="text-foreground/90 text-[0.7rem]">
                {feature.reasoning}
              </span>
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}
