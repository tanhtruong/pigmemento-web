/// <reference types="vitest/config" />
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep GSAP (core + plugins) in its own chunk so it stays out of the
          // main bundle. The bundle-guard allowlist accepts `gsap-` filenames.
          if (id.includes('node_modules/gsap')) return 'gsap-vendor';
          // Quarantine the 3D stack (three + react-three-fiber + drei) in its
          // own chunk so it never reaches the landing first-paint chunk or any
          // `/app/*` chunk. The bundle-guard allowlist accepts `three-` names.
          if (
            id.includes('node_modules/three') ||
            id.includes('node_modules/@react-three')
          )
            return 'three-vendor';
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
