import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, View, useTexture } from '@react-three/drei';
import { type RefObject, Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { LIBRARY_SPECIMENS } from '@/lib/library-specimens';
import { travelAt } from './library-beats';

/**
 * The specimen stage (#161) + the lens (#162). The 24 ISIC specimens are a
 * horizontal strip that slides behind a fixed dermatoscope reticle as the page
 * scrolls (0→1 progress from the pin scrub, read in useFrame). Each specimen
 * carries the lens shader: out of focus it softens (depth of field); under the
 * lens it sharpens and its real edges + colour variance are lifted off the image
 * as a FLAT bone glow — the image-derived feature read (PRD §6).
 *
 * Anti-rhyme contract (§12): the glow is flat and bone-toned — never the Act's
 * relief/raking-light, and never the blue-white veil (spent once, at the Act's
 * verdict). Renders as a drei <View> into the one shared landing canvas (#159).
 * `r3f-*` named to stay in the quarantined chunk.
 */

const PLANE_H = 1.8;
const PLANE_W = 2.4; // ~4:3, matching the source specimens
const SPACING = 3.2;
const FOCUS_FALLOFF = 4.2;
const LINE = '#9a958c';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uTexel;
  uniform float uFocus; // 0 far .. 1 under the lens
  varying vec2 vUv;

  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  void main() {
    vec3 sharp = texture2D(uTex, vUv).rgb;

    // Depth of field — a cheap 4-tap blur whose radius shrinks into focus.
    float br = mix(2.6, 0.0, uFocus);
    vec3 blur = (
      texture2D(uTex, vUv + uTexel * vec2( br, 0.0)).rgb +
      texture2D(uTex, vUv + uTexel * vec2(-br, 0.0)).rgb +
      texture2D(uTex, vUv + uTexel * vec2(0.0,  br)).rgb +
      texture2D(uTex, vUv + uTexel * vec2(0.0, -br)).rgb
    ) * 0.25;
    vec3 col = mix(blur, sharp, smoothstep(0.0, 0.6, uFocus));

    // Image-derived feature lift — edges + local colour variance, FLAT (no
    // normals, no lighting): the lens reads what's there, it doesn't sculpt it.
    float e = 1.5;
    float gx = luma(texture2D(uTex, vUv + uTexel * vec2(e, 0.0)).rgb)
             - luma(texture2D(uTex, vUv - uTexel * vec2(e, 0.0)).rgb);
    float gy = luma(texture2D(uTex, vUv + uTexel * vec2(0.0, e)).rgb)
             - luma(texture2D(uTex, vUv - uTexel * vec2(0.0, e)).rgb);
    float edge = clamp(length(vec2(gx, gy)) * 6.0, 0.0, 1.0);
    float chroma = length(sharp - vec3(luma(sharp))); // colour spread = pigment variance
    float feature = max(edge, chroma * 1.6);

    float lift = smoothstep(0.55, 1.0, uFocus); // only under the lens — the climax
    col += feature * lift * 0.6 * vec3(0.93, 0.91, 0.87); // flat bone glow

    gl_FragColor = vec4(col, 0.16 + uFocus * 0.84);
  }
`;

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
  return (
    <>
      {textures.map((texture, i) => (
        <Specimen
          key={LIBRARY_SPECIMENS[i]}
          texture={texture}
          index={i}
          progressRef={progressRef}
        />
      ))}
    </>
  );
}

function Specimen({
  texture,
  index,
  progressRef,
}: {
  texture: THREE.Texture;
  index: number;
  progressRef: RefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const img = texture.image as { width?: number; height?: number } | undefined;
  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uTexel: {
        value: new THREE.Vector2(
          1 / (img?.width ?? 1504),
          1 / (img?.height ?? 1129),
        ),
      },
      uFocus: { value: 0 },
    }),
    [texture, img?.width, img?.height],
  );

  useFrame(() => {
    const x = index * SPACING - travelAt(progressRef.current);
    const focus = Math.max(0, 1 - Math.abs(x) / FOCUS_FALLOFF);
    const mesh = meshRef.current;
    if (mesh) {
      mesh.position.x = x;
      mesh.scale.setScalar(0.9 + focus * 0.1);
    }
    if (materialRef.current) materialRef.current.uniforms.uFocus.value = focus;
  });

  return (
    <mesh ref={meshRef} position={[index * SPACING, 0, 0]}>
      <planeGeometry args={[PLANE_W, PLANE_H]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
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
