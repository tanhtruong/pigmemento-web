import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor, Sparkles, useTexture } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';
import * as THREE from 'three';

type R3fSceneProps = {
  imageSrc: string;
  /** Run the render loop only while true (tab visible + canvas on-screen). */
  active: boolean;
  className?: string;
};

const DPR_CEILING = 1.5;
const PARALLAX = 0.12;

/**
 * The "specimen on the stage" (#125): a flat case-image plane on a softly-lit
 * slide, with a restrained ambient "dermoscopy field" (drei <Sparkles>) and fog
 * for atmospheric depth. The dermoscopy plane stays an honest flat 2D image —
 * we never fake topology on a melanoma. No camera choreography or ABCDE pins
 * yet (#130, #131).
 *
 * Decorative + `aria-hidden`: the real, accessible, indexable content is the
 * static AnnotatedLesionImage underneath. Lazy-loaded so three/r3f/drei stay in
 * the quarantined async chunk enforced by the bundle guard (#126).
 */
export default function R3fScene({
  imageSrc,
  active,
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
      camera={{ position: [0, 0, 3.2], fov: 38 }}
      gl={{ antialias: true }}
    >
      <PerformanceMonitor
        onDecline={() => setDprCeiling(1)}
        onIncline={() => setDprCeiling(DPR_CEILING)}
      />
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
