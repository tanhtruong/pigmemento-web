export type ChunkInfo = {
  fileName: string;
  code: string;
};

const GSAP_MARKERS = [/\bgsap\b/, /\bScrollTrigger\b/];

const containsGsap = (code: string) =>
  GSAP_MARKERS.some((pattern) => pattern.test(code));

const isAllowedGsapChunk = (fileName: string) =>
  fileName.startsWith('landing-') || fileName.startsWith('gsap-');

export const findForbiddenGsapChunks = (chunks: ChunkInfo[]): string[] =>
  chunks
    .filter((chunk) => containsGsap(chunk.code))
    .filter((chunk) => !isAllowedGsapChunk(chunk.fileName))
    .map((chunk) => chunk.fileName);

// The 3D stack (three + react-three-fiber + drei) is quarantined in its own
// `three-vendor` chunk (see vite.config manualChunks) and may only be pulled in
// by async `three-`/`r3f-` chunks. Markers are three-specific on purpose: we
// match the `three-vendor` import path, the `THREE` namespace, and the
// `@react-three` scope — never a bare `three`, which would false-positive on
// the English word in UI copy. Stricter than the GSAP rule: three is forbidden
// in `landing-` too, so it can never reach the landing first-paint chunk.
const THREE_MARKERS = [/three-vendor/, /\bTHREE\b/, /@react-three\b/];

const containsThree = (code: string) =>
  THREE_MARKERS.some((pattern) => pattern.test(code));

const isAllowedThreeChunk = (fileName: string) =>
  fileName.startsWith('three-') || fileName.startsWith('r3f-');

export const findForbiddenThreeChunks = (chunks: ChunkInfo[]): string[] =>
  chunks
    .filter((chunk) => containsThree(chunk.code))
    .filter((chunk) => !isAllowedThreeChunk(chunk.fileName))
    .map((chunk) => chunk.fileName);
