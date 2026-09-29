/// <reference types="node" />
import { Script } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { buildServiceWorker, precacheList } from './serviceWorker';

describe('precacheList', () => {
  it('caches the app shell and assets, relative to the scope', () => {
    expect(
      precacheList([
        'index.html',
        'assets/index-abc.js',
        'assets/manrope-latin.woff2',
        'icons/icon-192.png',
      ]),
    ).toEqual([
      './',
      './assets/index-abc.js',
      './assets/manrope-latin.woff2',
      './icons/icon-192.png',
      './index.html',
    ]);
  });

  it('skips audio, source maps, the 404 page and the worker itself', () => {
    expect(
      precacheList([
        'assets/night-swim-1a2b.mp3',
        'assets/x.js.map',
        '404.html',
        'sw.js',
        'assets\\a.css',
      ]),
    ).toEqual(['./', './assets/a.css']);
  });
});

describe('buildServiceWorker', () => {
  const source = buildServiceWorker({
    cacheName: 'sanctuary-0.3.0-abc123',
    precache: ['./', './index.html'],
  });

  it('produces valid JavaScript', () => {
    expect(() => new Script(source)).not.toThrow();
  });

  it('embeds the cache name and the precache list', () => {
    expect(source).toContain('"sanctuary-0.3.0-abc123"');
    expect(source).toContain('["./","./index.html"]');
  });

  it('never skips waiting (a running page keeps its own version)', () => {
    expect(source).not.toContain('skipWaiting');
  });
});
