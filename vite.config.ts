/// <reference types="node" />
/// <reference types="vitest/config" />
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { buildServiceWorker, precacheList } from './src/pwa/serviceWorker';

/** VERSION is the single source of truth; the app reads it at build time. */
const version = readFileSync(new URL('./VERSION', import.meta.url), 'utf8').trim();

/** Files copied as-is from public/, relative paths with forward slashes. */
function publicFiles(dir = new URL('./public/', import.meta.url), prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? publicFiles(new URL(`${entry.name}/`, dir), `${prefix}${entry.name}/`)
      : [`${prefix}${entry.name}`],
  );
}

/**
 * Emits sw.js with the exact list of this build's files. The cache name includes
 * a hash of that list, so every deploy gets a fresh cache and old ones are removed.
 */
function serviceWorker(): Plugin {
  return {
    name: 'sanctuary-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const precache = precacheList([...Object.keys(bundle), ...publicFiles()]);
      const hash = createHash('sha256').update(precache.join('\n')).digest('hex').slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: buildServiceWorker({ cacheName: `sanctuary-${version}-${hash}`, precache }),
      });
    },
  };
}

// Relative base + hash routing = the build works on GitHub Pages under any
// repository path (and from a plain file server) without 404 fallbacks.
export default defineConfig({
  base: './',
  plugins: [react(), serviceWorker()],
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
