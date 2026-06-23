import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, View, useTexture } from '@react-three/drei';
import { type RefObject, Suspense, useRef } from 'react';
import * as THREE from 'three';

import { LIBRARY_SPECIMENS } from '@/lib/library-specimens';

/**
 * The specimen stage (#161) — the core mechanic of the library set-piece. The 24
 * ISIC specimens are a single horizontal strip that slides behind a fixed
 * dermatoscope reticle as the page scrolls (0→1 progress from the pin scrub,
 * read here in useFrame). The specimen under the lens is in focus; the rest dim
 * and shrink into out-of-focus volume. Real lens optics — refraction, depth of
 * field — are #162; the four lock-in beats are #163.
 *
 * Renders as a drei <View> into the one shared landing canvas (#159), so there
 * is no second WebGL context. `r3f-*` named to stay in the quarantined chunk.
 */

const PLANE_H = 1.8;
const PLANE_W = 2.4; // ~4:3, matching the source specimens
const SPACING = 3.2;
const TRAVEL = (LIBRARY_SPECIMENS.length - 1) * SPACING;
const FOCUS_FALLOFF = 4.2;
const LINE = '#9a958c';

type Props = {
  progressRef: RefObject<number>;
};

export default function R3fLibraryStage({ progressRef }: Props) {
  return (
    <View style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <PerspectiveCamera makeDefault fov={42} position={[0, 0, 6.5]} />
      <color attach="background" args={['#0b0a09']} />
      <fog attach="fog" args={['#0b0a09', 7, 15]} />
      <Suspense fallback={null}>
        <Strip progressRef={progressRef} />
      </Suspense>
      <Reticle />
    </View>
  );
}

function Strip({ progressRef }: { progressRef: RefObject<number> }) {
  const textures = useTexture(LIBRARY_SPECIMENS as string[]);
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const x = -progressRef.current * TRAVEL;
    group.position.x = x;
    // Focus falls off with distance from the centre lens — the specimen under
    // the reticle is sharp and full, the rest dim and shrink into volume.
    for (let i = 0; i < meshRefs.current.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const distance = Math.abs(i * SPACING + x);
      const focus = Math.max(0, 1 - distance / FOCUS_FALLOFF);
      mesh.scale.setScalar(0.9 + focus * 0.1);
      (mesh.material as THREE.MeshBasicMaterial).opacity = 0.16 + focus * 0.84;
    }
  });

  return (
    <group ref={groupRef}>
      {textures.map((texture, i) => (
        <mesh
          key={LIBRARY_SPECIMENS[i]}
          position={[i * SPACING, 0, 0]}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
        >
          <planeGeometry args={[PLANE_W, PLANE_H]} />
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** A fixed dermatoscope reticle at screen centre — the strip slides behind it. */
function Reticle() {
  return (
    <group position={[0, 0, 2]}>
      <mesh>
        <ringGeometry args={[1.16, 1.18, 96]} />
        <meshBasicMaterial
          color={LINE}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <planeGeometry args={[0.46, 0.008]} />
        <meshBasicMaterial color={LINE} transparent opacity={0.55} />
      </mesh>
      <mesh>
        <planeGeometry args={[0.008, 0.46]} />
        <meshBasicMaterial color={LINE} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}
