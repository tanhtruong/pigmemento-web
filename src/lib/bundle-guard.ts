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
// by async `three-`/`r3f-` chunks. Markers are three-specific on purpose:
//   1. a STATIC import of the three-vendor chunk — i.e. a chunk that evaluates
//      three at load. This matches `from"./three-vendor…"` / side-effect
//      `import"./three-vendor…"`, NOT the `three-vendor` string a lazy boundary
//      legitimately embeds in its dynamic-import preload dep map (which only
//      fetches three when the gated `import()` fires).
//   2/3. the `THREE` namespace and `@react-three` scope — three library code
//      inlined into a chunk. Never a bare `three`, which would false-positive
//      on the English word in UI copy.
// Stricter than the GSAP rule: three is forbidden in `landing-` too, so it can
// never reach the landing first-paint chunk.
const THREE_MARKERS = [
  /\b(?:from|import)\s*"[^"]*three-vendor/,
  /\bTHREE\b/,
  /@react-three\b/,
];

const containsThree = (code: string) =>
  THREE_MARKERS.some((pattern) => pattern.test(code));

const isAllowedThreeChunk = (fileName: string) =>
  fileName.startsWith('three-') || fileName.startsWith('r3f-');

export const findForbiddenThreeChunks = (chunks: ChunkInfo[]): string[] =>
  chunks
    .filter((chunk) => containsThree(chunk.code))
    .filter((chunk) => !isAllowedThreeChunk(chunk.fileName))
    .map((chunk) => chunk.fileName);
