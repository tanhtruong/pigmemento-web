import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * SPIKE (#144, gated) — dimensional-dermoscopy proof of concept. Throwaway.
 *
 * Proves the hero effect before any Act-I scaffolding: the real ISIC photo on a
 * flat plane, lit by a movable raking dermatoscope light so the surface reads as
 * dimensional. No geometry is displaced — the relief is purely a lighting effect
 * (an interpretive relief, never a literal height claim).
 *
 * The credibility guardrail (dark != deep): height is NOT luminance. A naive
 * luminance->height map would sink the dark melanin core into a crater, which is
 * anatomically backwards. Instead the relief normal comes from the HIGH-PASS of
 * luminance (fine skin furrows / pigment-network texture — near zero over the
 * broad dark blob) plus a procedural radial DOME that's independent of colour.
 * So the pigment stays flat albedo; only real surface texture and form catch the
 * light.
 *
 * Named `r3f-*` and lazy-imported so three/r3f/drei stay in the quarantined
 * async chunk the bundle guard allowlists (#126).
 */

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
  uniform float uTime;
  uniform vec2 uLight;
  uniform float uRelief;
  uniform float uDome;
  varying vec2 vUv;

  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  // Low-frequency luminance (3x3 box at a wide radius) ~= the broad pigment.
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

    // Relief normal: fine furrows (high-pass gradient) + procedural dome.
    float e = 1.25;
    float hL = surf(vUv - vec2(uTexel.x * e, 0.0));
    float hR = surf(vUv + vec2(uTexel.x * e, 0.0));
    float hD = surf(vUv - vec2(0.0, uTexel.y * e));
    float hU = surf(vUv + vec2(0.0, uTexel.y * e));

    vec2 d = vUv - 0.5;
    float dome = exp(-dot(d, d) * 5.0);
    vec2 domeGrad = dome * (-10.0) * d; // broad raised form, colour-independent

    float gx = (hR - hL) * 24.0 * uRelief + domeGrad.x * uDome;
    float gy = (hU - hD) * 24.0 * uRelief + domeGrad.y * uDome;
    vec3 N = normalize(vec3(-gx, -gy, 1.0));

    // Raking dermatoscope light: low grazing elevation, swept by the cursor.
    float az = uLight.x * 3.14159;
    float el = mix(0.10, 0.42, uLight.y * 0.5 + 0.5);
    vec3 L = normalize(vec3(cos(az) * cos(el), sin(az) * cos(el), sin(el)));
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 H = normalize(L + V);

    float diff = max(dot(N, L), 0.0);
    float spec = pow(max(dot(N, H), 0.0), 26.0) * 0.5; // immersion-fluid sheen
    float ambient = 0.16;

    vec3 lightCol = vec3(1.0, 0.97, 0.92);
    vec3 lit = albedo * (ambient + diff * 1.15 * lightCol) + spec * lightCol;

    // Dermatoscope vignette — looking through the scope.
    float vig = smoothstep(0.78, 0.30, length(d * vec2(1.0, 1.08)));
    lit *= mix(0.5, 1.0, vig);

    // uRelief is the master effect amount (eased on toggle): cross-fade to the
    // plain flat photo when off, so the harness gives an honest before/after.
    gl_FragColor = vec4(mix(albedo, lit, uRelief), 1.0);
  }
`;

type SpikeProps = { imageSrc: string; reliefOn: boolean };

function LesionPlane({ imageSrc, reliefOn }: SpikeProps) {
  const texture = useTexture(imageSrc);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const img = texture.image as { width?: number; height?: number } | undefined;
  const texW = img?.width ?? 1024;
  const texH = img?.height ?? 1280;
  // Construct the uniforms once. The immutability lint won't let us mutate hook
  // results, so build them here and only ever write through materialRef (a ref —
  // legitimately mutable) inside useFrame.
  const uniforms = useMemo(
    () => ({
      uTex: { value: texture },
      uTexel: { value: new THREE.Vector2(1 / texW, 1 / texH) },
      uTime: { value: 0 },
      uLight: { value: new THREE.Vector2(0, 0) },
      uRelief: { value: 1 },
      uDome: { value: 1 },
    }),
    [texture, texW, texH],
  );

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    const u = mat.uniforms;
    u.uTime.value += delta;
    // Cursor rakes the light; ease for a hand-held feel.
    u.uLight.value.x = THREE.MathUtils.lerp(
      u.uLight.value.x,
      state.pointer.x,
      0.07,
    );
    u.uLight.value.y = THREE.MathUtils.lerp(
      u.uLight.value.y,
      state.pointer.y,
      0.07,
    );
    const target = reliefOn ? 1 : 0;
    u.uRelief.value = THREE.MathUtils.lerp(u.uRelief.value, target, 0.12);
    u.uDome.value = THREE.MathUtils.lerp(u.uDome.value, target, 0.12);
    // A touch of specimen tilt toward the cursor sells the dimensionality.
    const g = groupRef.current;
    if (g) {
      g.rotation.y = THREE.MathUtils.lerp(
        g.rotation.y,
        state.pointer.x * 0.08,
        0.06,
      );
      g.rotation.x = THREE.MathUtils.lerp(
        g.rotation.x,
        -state.pointer.y * 0.08,
        0.06,
      );
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <planeGeometry args={[2.0, 2.5]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
    </group>
  );
}

export default function R3fLesionSpike({ imageSrc, reliefOn }: SpikeProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.25], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#0b0a09']} />
      <Suspense fallback={null}>
        <LesionPlane imageSrc={imageSrc} reliefOn={reliefOn} />
      </Suspense>
    </Canvas>
  );
}
