#!/usr/bin/env node
/**
 * Bundle guardrail: fails if a quarantined vendor leaks into a chunk it must
 * never reach.
 *
 *   GSAP  — allowed only in `landing-*` / `gsap-*` chunks.
 *   3D    — three / react-three-fiber / drei allowed only in async
 *           `three-*` / `r3f-*` chunks (NOT `landing-*`: the 3D stack must
 *           never touch the landing first-paint chunk or any `/app/*` chunk).
 *
 * Mirror of the pure functions in src/lib/bundle-guard.ts. If you change a
 * marker or allowlist, change both — the TS functions are unit-tested in
 * bundle-guard.test.ts.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS_DIR = join(process.cwd(), 'dist', 'assets');

const GSAP_MARKERS = [/\bgsap\b/, /\bScrollTrigger\b/];

const containsGsap = (code) =>
  GSAP_MARKERS.some((pattern) => pattern.test(code));

const isAllowedGsapChunk = (fileName) =>
  fileName.startsWith('landing-') || fileName.startsWith('gsap-');

// three-specific markers: (1) a STATIC import of the three-vendor chunk
// (`from"./three-vendor…"` — a chunk that evaluates three at load), NOT the
// `three-vendor` string a lazy boundary embeds in its dynamic-import preload
// dep map; (2/3) the `THREE` namespace / `@react-three` scope for inlined three
// code — never a bare `three`, which false-positives on the English word.
const THREE_MARKERS = [
  /\b(?:from|import)\s*"[^"]*three-vendor/,
  /\bTHREE\b/,
  /@react-three\b/,
];

const containsThree = (code) =>
  THREE_MARKERS.some((pattern) => pattern.test(code));

const isAllowedThreeChunk = (fileName) =>
  fileName.startsWith('three-') || fileName.startsWith('r3f-');

const findViolations = (chunks, contains, isAllowed) =>
  chunks
    .filter((chunk) => contains(chunk.code))
    .filter((chunk) => !isAllowed(chunk.fileName))
    .map((chunk) => chunk.fileName);

const readChunks = () => {
  let entries;
  try {
    entries = readdirSync(ASSETS_DIR);
  } catch (error) {
    console.error(`Could not read ${ASSETS_DIR}. Run \`npm run build\` first.`);
    console.error(error.message);
    process.exit(2);
  }

  return entries
    .filter((name) => name.endsWith('.js'))
    .map((fileName) => ({
      fileName,
      code: readFileSync(join(ASSETS_DIR, fileName), 'utf8'),
    }));
};

const main = () => {
  const chunks = readChunks();

  const gsapViolations = findViolations(
    chunks,
    containsGsap,
    isAllowedGsapChunk,
  );
  const threeViolations = findViolations(
    chunks,
    containsThree,
    isAllowedThreeChunk,
  );

  if (gsapViolations.length === 0 && threeViolations.length === 0) {
    console.log(`bundle-guard: clean. checked ${chunks.length} chunks.`);
    return;
  }

  if (gsapViolations.length > 0) {
    console.error('bundle-guard: GSAP leaked into the following chunks:');
    for (const fileName of gsapViolations) {
      console.error(`  - ${fileName}`);
    }
    console.error(
      '\nGSAP must be lazy-loaded from the landing route only (see src/lib/lazy-gsap.ts).',
    );
  }

  if (threeViolations.length > 0) {
    console.error(
      'bundle-guard: the 3D stack (three/react-three) leaked into the following chunks:',
    );
    for (const fileName of threeViolations) {
      console.error(`  - ${fileName}`);
    }
    console.error(
      '\nthree / react-three-fiber / drei must stay in the `three-vendor` chunk,' +
        '\nloaded only from async `three-`/`r3f-` chunks — never `/app/*` or landing first paint.',
    );
  }

  process.exit(1);
};

main();
