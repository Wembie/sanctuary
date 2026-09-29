/// <reference types="node" />
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

/** VERSION is the single source of truth; the app reads it at build time. */
const version = readFileSync(new URL('./VERSION', import.meta.url), 'utf8').trim();

// Relative base + hash routing = the build works on GitHub Pages under any
// repository path (and from a plain file server) without 404 fallbacks.
export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 2048,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
});
