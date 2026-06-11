export type ChunkInfo = {
  fileName: string;
  code: string;
};

const GSAP_MARKERS = [/\bgsap\b/, /\bScrollTrigger\b/];

const containsGsap = (code: string) =>
  GSAP_MARKERS.some((pattern) => pattern.test(code));

const isAllowedChunk = (fileName: string) =>
  fileName.startsWith('landing-') || fileName.startsWith('gsap-');

export const findForbiddenGsapChunks = (chunks: ChunkInfo[]): string[] =>
  chunks
    .filter((chunk) => containsGsap(chunk.code))
    .filter((chunk) => !isAllowedChunk(chunk.fileName))
    .map((chunk) => chunk.fileName);
