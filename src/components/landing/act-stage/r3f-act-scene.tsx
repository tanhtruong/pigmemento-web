import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import { type RefObject, Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { AbcdeFeature } from '@/features/cases/types/abcde-feature';
import { cameraPositionAt } from '../case-stage/camera-beats';
import { pinPositionFromCenter, pinReveal } from '../case-stage/pin-layout';
import {
  ACT_CAMERA_BEATS,
  exposureAt,
  rakeLightAt,
  READING_END,
  READING_START,
} from './act-beats';

/**
 * Act I — the pinned cinematic take (#146). One continuous WebGL "take" over the
 * lesion: the camera dollies, the raking dermatoscope light sweeps, and the
 * graticule snaps onto the ABCDE features — all choreographed off the single
 * scroll progress the pin scrubs (see use-act-scroll), read here in useFrame.
 *
 * The lesion is the dimensional-dermoscopy material proven in the #144 spike:
 * the real photo, given relief from its own high-frequency luminance (skin
 * furrows / pigment network) plus a colour-independent dome — so the dark
 * melanin stays pigment on the surface, never a crater. Refined here with a
 * softer immersion sheen, proper sRGB lighting, and a scroll-driven exposure.
 *
 * Lazy-loaded + `r3f-*` named so three/r3f/drei stay in the quarantined chunk.
 */

const PLANE_W = 2.1;
const PLANE_H = 2.6;
const LINE = '#9a958c';
const BONE = '#ede8df';
const VEIL = '#7e94a6';

// Synthesised instrument readouts for the reading beat (real values land with
// the case data later). A graticule reads in measurements, not prose.
const READOUT: Record<AbcdeFeature['letter'], string> = {
  A: 'axis 7.2 mm',
  B: 'notch 0.6 mm',
  C: '4 hues',
  D: 'Ø 7.8 mm',
  E: 'Δ ~90 d',
};

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
  uniform vec2 uLight;
  uniform float uExposure;
  varying vec2 vUv;

  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  float lowLuma(vec2 uv) {
    float r = 3.0;
    float s =
      luma(texture2D(uTex, uv + uTexel * vec2(-r, -r)).rgb) +
      luma(texture2D(uTex, uv + uTexel * vec2( r, -r)).rgb) +
      luma(texture2D(uTex, uv + uTexel * vec2(-r,  r)).rgb) +
      luma(texture2D(uTex, uv + uTexel * vec2( r,  r)).rgb) +
      luma(texture2D(uTex, uv + uTexel * vec2( 0.0,  r)).rgb) +
      luma(texture2D(uTex, uv + uTexel * vec2( 0.0, -r)).rgb) +
      luma(texture2D(uTex, uv + uTexel * vec2( r, 0.0)).rgb) +
      luma(texture2D(uTex, uv + uTexel * vec2(-r, 0.0)).rgb) +
      luma(texture2D(uTex, uv).rgb);
    return s / 9.0;
  }

  // High-pass luminance = fine surface texture, decoupled from broad pigment.
  float surf(vec2 uv) {
    return luma(texture2D(uTex, uv).rgb) - lowLuma(uv);
  }

  void main() {
    vec3 albedo = texture2D(uTex, vUv).rgb;
    vec3 albedoLin = pow(albedo, vec3(2.2)); // sRGB -> linear for lighting

    float e = 1.25;
    float hL = surf(vUv - vec2(uTexel.x * e, 0.0));
    float hR = surf(vUv + vec2(uTexel.x * e, 0.0));
    float hD = surf(vUv - vec2(0.0, uTexel.y * e));
    float hU = surf(vUv + vec2(0.0, uTexel.y * e));

    vec2 d = vUv - 0.5;
    float dome = exp(-dot(d, d) * 5.0);
    vec2 domeGrad = dome * (-10.0) * d;

    float gx = (hR - hL) * 24.0 + domeGrad.x;
    float gy = (hU - hD) * 24.0 + domeGrad.y;
    vec3 N = normalize(vec3(-gx, -gy, 1.0));

    float az = uLight.x * 3.14159;
    float el = mix(0.10, 0.42, uLight.y * 0.5 + 0.5);
    vec3 L = normalize(vec3(cos(az) * cos(el), sin(az) * cos(el), sin(el)));
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 H = normalize(L + V);

    float diff = max(dot(N, L), 0.0);
    float spec = pow(max(dot(N, H), 0.0), 32.0) * 0.28; // softer immersion sheen
    float ambient = 0.14;

    vec3 lightCol = vec3(1.0, 0.97, 0.92);
    vec3 lit = albedoLin * (ambient + diff * 1.15 * lightCol) + spec * lightCol;
    lit *= uExposure;

    float vig = smoothstep(0.82, 0.32, length(d * vec2(1.0, 1.08)));
    lit *= mix(0.45, 1.0, vig);

    vec3 outc = pow(max(lit, 0.0), vec3(1.0 / 2.2)); // linear -> sRGB
    gl_FragColor = vec4(outc, 1.0);
  }
`;

type SceneProps = {
  imageSrc: string;
  features: AbcdeFeature[];
  active: boolean;
  scrollProgressRef: RefObject<number>;
};

export default function R3fActScene({
  imageSrc,
  features,
  active,
  scrollProgressRef,
}: SceneProps) {
  return (
    <Canvas
      aria-hidden
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: cameraPositionAt(0, ACT_CAMERA_BEATS), fov: 38 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#0b0a09']} />
      <fog attach="fog" args={['#0b0a09', 4.0, 8.5]} />
      <CameraRig scrollProgressRef={scrollProgressRef} />
      <Suspense fallback={null}>
        <Specimen
          imageSrc={imageSrc}
          features={features}
          scrollProgressRef={scrollProgressRef}
        />
      </Suspense>
    </Canvas>
  );
}

function CameraRig({
  scrollProgressRef,
}: {
  scrollProgressRef: RefObject<number>;
}) {
  const camera = useThree((state) => state.camera);
  const target = useRef(
    new THREE.Vector3(...cameraPositionAt(0, ACT_CAMERA_BEATS)),
  );

  useFrame(() => {
    const [x, y, z] = cameraPositionAt(
      scrollProgressRef.current,
      ACT_CAMERA_BEATS,
    );
    target.current.set(x, y, z);
    camera.position.lerp(target.current, 0.1);
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
  features: AbcdeFeature[];
  scrollProgressRef: RefObject<number>;
}) {
  const texture = useTexture(imageSrc);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const img = texture.image as { width?: number; height?: number } | undefined;
  const texW = img?.width ?? 1024;
  const texH = img?.height ?? 1280;
  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uTexel: { value: new THREE.Vector2(1 / texW, 1 / texH) },
      uLight: { value: new THREE.Vector2(-0.85, -0.55) },
      uExposure: { value: 0.4 },
    }),
    [texture, texW, texH],
  );

  useFrame((state) => {
    const p = scrollProgressRef.current;
    const mat = materialRef.current;
    if (mat) {
      const [lx, ly] = rakeLightAt(p);
      mat.uniforms.uLight.value.set(lx, ly);
      mat.uniforms.uExposure.value = exposureAt(p);
    }
    // Subtle pointer parallax — the specimen tilts toward the cursor.
    const g = groupRef.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.lerp(
        g.rotation.y,
        state.pointer.x * 0.06,
        0.05,
      );
      g.rotation.x = THREE.MathUtils.lerp(
        g.rotation.x,
        -state.pointer.y * 0.06,
        0.05,
      );
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[PLANE_W + 0.5, PLANE_H + 0.5]} />
        <meshBasicMaterial color="#0f0e0d" />
      </mesh>
      <mesh>
        <planeGeometry args={[PLANE_W, PLANE_H]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
      <Graticule features={features} scrollProgressRef={scrollProgressRef} />
    </group>
  );
}

/** A thin emissive line as a flat rect — consistent width regardless of GPU. */
function Line({
  length,
  thickness = 0.006,
  color = LINE,
  opacity = 0.55,
  rotation = 0,
  position = [0, 0, 0.02] as [number, number, number],
}: {
  length: number;
  thickness?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  position?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={[0, 0, rotation]}>
      <planeGeometry args={[length, thickness]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function Crosshair({ size = 0.12, color = LINE, opacity = 0.6 }) {
  const gap = size * 0.35;
  const arm = (size - gap) / 2;
  const off = gap / 2 + arm / 2;
  return (
    <group>
      <Line
        length={arm}
        thickness={0.006}
        color={color}
        opacity={opacity}
        position={[off, 0, 0.02]}
      />
      <Line
        length={arm}
        thickness={0.006}
        color={color}
        opacity={opacity}
        position={[-off, 0, 0.02]}
      />
      <Line
        length={arm}
        thickness={0.006}
        color={color}
        opacity={opacity}
        rotation={Math.PI / 2}
        position={[0, off, 0.02]}
      />
      <Line
        length={arm}
        thickness={0.006}
        color={color}
        opacity={opacity}
        rotation={Math.PI / 2}
        position={[0, -off, 0.02]}
      />
    </group>
  );
}

/**
 * The graticule (#146 signature): a persistent eyepiece reticle — centre
 * crosshair, hairline ring, calibrated mm scale bar — plus a crosshair that
 * locks onto each ABCDE feature with its readout, revealed one at a time across
 * the reading beat. Decorative + aria-hidden; the accessible ABCDE text is the
 * static layer (added with the page chrome in #145).
 */
function Graticule({
  features,
  scrollProgressRef,
}: {
  features: AbcdeFeature[];
  scrollProgressRef: RefObject<number>;
}) {
  const pinRefs = useRef<(THREE.Group | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useFrame(() => {
    const p = scrollProgressRef.current;
    for (let i = 0; i < features.length; i++) {
      const reveal = pinReveal(
        i,
        features.length,
        p,
        READING_START,
        READING_END,
      );
      const pin = pinRefs.current[i];
      if (pin) pin.scale.setScalar(reveal);
      const label = labelRefs.current[i];
      if (label) label.style.opacity = String(reveal);
    }
  });

  return (
    <group>
      {/* Persistent eyepiece reticle — you are looking through the instrument. */}
      <Crosshair size={0.14} opacity={0.4} />
      <mesh position={[0, 0, 0.02]}>
        <ringGeometry args={[0.95, 0.957, 96]} />
        <meshBasicMaterial
          color={LINE}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Calibrated mm scale bar. */}
      <group position={[0, -1.18, 0.02]}>
        <Line length={0.6} thickness={0.006} opacity={0.5} />
        <Line
          length={0.05}
          thickness={0.006}
          opacity={0.5}
          rotation={Math.PI / 2}
          position={[-0.3, 0, 0.02]}
        />
        <Line
          length={0.05}
          thickness={0.006}
          opacity={0.5}
          rotation={Math.PI / 2}
          position={[0.3, 0, 0.02]}
        />
        <Html position={[0, -0.08, 0]} center pointerEvents="none">
          <div
            aria-hidden
            style={{
              font: '10px ui-monospace, monospace',
              letterSpacing: '0.08em',
              color: LINE,
              whiteSpace: 'nowrap',
            }}
          >
            5 mm
          </div>
        </Html>
      </group>

      {/* ABCDE feature crosshairs, revealed across the reading beat. */}
      {features.map((feature, i) => (
        <group
          key={feature.letter}
          position={pinPositionFromCenter(
            feature.centerPoint,
            PLANE_W,
            PLANE_H,
            0.04,
          )}
          scale={0}
          ref={(el) => {
            pinRefs.current[i] = el;
          }}
        >
          <Crosshair size={0.1} color={VEIL} opacity={0.95} />
          <mesh>
            <ringGeometry args={[0.052, 0.06, 48]} />
            <meshBasicMaterial
              color={VEIL}
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Html position={[0.12, 0.08, 0]} pointerEvents="none">
            <div
              aria-hidden
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              style={{
                opacity: 0,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px',
              }}
            >
              <span
                style={{
                  font: '600 11px ui-monospace, monospace',
                  color: VEIL,
                }}
              >
                {feature.letter}
              </span>
              <span
                style={{
                  font: '11px ui-monospace, monospace',
                  color: BONE,
                  opacity: 0.85,
                }}
              >
                {READOUT[feature.letter]}
              </span>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
