/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base + hash routing = the build works on GitHub Pages under any
// repository path (and from a plain file server) without 404 fallbacks.
export default defineConfig({
  base: './',
  plugins: [react()],
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
