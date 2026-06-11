#!/usr/bin/env node
/**
 * Bundle guardrail: fails if GSAP appears in any /app/* chunk.
 *
 * Allowed: chunks whose filename starts with `landing-` or `gsap-`.
 * Disallowed: GSAP markers (`gsap`, `ScrollTrigger`) in any other chunk.
 *
 * Mirror of the pure function in src/lib/bundle-guard.ts. If you change the
 * allowlist, change both — the TS function is unit-tested in bundle-guard.test.ts.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS_DIR = join(process.cwd(), 'dist', 'assets');

const GSAP_MARKERS = [/\bgsap\b/, /\bScrollTrigger\b/];

const containsGsap = (code) =>
  GSAP_MARKERS.some((pattern) => pattern.test(code));

const isAllowedChunk = (fileName) =>
  fileName.startsWith('landing-') || fileName.startsWith('gsap-');

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
  const violations = chunks
    .filter((chunk) => containsGsap(chunk.code))
    .filter((chunk) => !isAllowedChunk(chunk.fileName))
    .map((chunk) => chunk.fileName);

  if (violations.length === 0) {
    console.log(`bundle-guard: clean. checked ${chunks.length} chunks.`);
    return;
  }

  console.error('bundle-guard: GSAP leaked into the following chunks:');
  for (const fileName of violations) {
    console.error(`  - ${fileName}`);
  }
  console.error(
    '\nGSAP must be lazy-loaded from the landing route only (see src/lib/lazy-gsap.ts).',
  );
  process.exit(1);
};

main();
