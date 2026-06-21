import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor, Sparkles, useTexture } from '@react-three/drei';
import { type RefObject, Suspense, useRef, useState } from 'react';
import * as THREE from 'three';

import { cameraPositionAt } from './camera-beats';

type R3fSceneProps = {
  imageSrc: string;
  /** Run the render loop only while true (tab visible + canvas on-screen). */
  active: boolean;
  /** Page scroll progress (0–1) driving the camera dolly — see camera-beats. */
  scrollProgressRef: RefObject<number>;
  className?: string;
};

const DPR_CEILING = 1.5;
const PARALLAX = 0.12;

/**
 * The "specimen on the stage" (#125): a flat case-image plane on a softly-lit
 * slide, with a restrained ambient "dermoscopy field" (drei <Sparkles>) and fog
 * for atmospheric depth. The dermoscopy plane stays an honest flat 2D image —
 * we never fake topology on a melanoma. A scroll-driven camera dollies through
 * four framings (#130); ABCDE pins are still #131.
 *
 * Decorative + `aria-hidden`: the real, accessible, indexable content is the
 * static AnnotatedLesionImage underneath. Lazy-loaded so three/r3f/drei stay in
 * the quarantined async chunk enforced by the bundle guard (#126).
 */
export default function R3fScene({
  imageSrc,
  active,
  scrollProgressRef,
  className,
}: R3fSceneProps) {
  // Adaptive quality: PerformanceMonitor lowers the DPR ceiling on sustained
  // frame-rate decline and restores it on recovery. Capped at 1.5 either way.
  const [dprCeiling, setDprCeiling] = useState(DPR_CEILING);

  return (
    <Canvas
      className={className}
      aria-hidden
      frameloop={active ? 'always' : 'never'}
      dpr={[1, dprCeiling]}
      camera={{ position: cameraPositionAt(0), fov: 38 }}
      gl={{ antialias: true }}
    >
      <PerformanceMonitor
        onDecline={() => setDprCeiling(1)}
        onIncline={() => setDprCeiling(DPR_CEILING)}
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
        <Specimen imageSrc={imageSrc} />
      </Suspense>
      <Sparkles
        count={36}
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

function Specimen({ imageSrc }: { imageSrc: string }) {
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
    </group>
  );
}
