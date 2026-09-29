/**
 * Build-time helpers for the service worker. Pure functions: the Vite plugin in
 * vite.config.ts feeds them the list of built files; tests call them directly.
 */

/** Audio is fetched with Range requests; caching it in a SW is fragile, so it stays online-only. */
const SKIP = /\.(map|mp3|ogg|oga|m4a|aac|wav|opus|flac|webm)$|(^|\/)404\.html$|(^|\/)sw\.js$/i;

/** Which built files to cache at install, as URLs relative to the SW scope. */
export function precacheList(files: readonly string[]): string[] {
  const urls = new Set<string>(['./']);
  for (const file of files) {
    const path = file.replace(/\\/g, '/').replace(/^\/+/, '');
    if (!path || SKIP.test(path)) continue;
    urls.add(`./${path}`);
  }
  return [...urls].sort();
}

/**
 * The service worker source.
 * - Navigation: network first (updates arrive when online), cached page when offline.
 * - Everything else same-origin: cache first, then network (and remember it).
 * - No skipWaiting: a new version takes over once every tab of the old one is closed,
 *   so a running page never loses the chunks it was built with.
 */
export function buildServiceWorker({
  cacheName,
  precache,
}: {
  cacheName: string;
  precache: string[];
}): string {
  return `/* Sanctuary service worker. Generated at build time. Do not edit. */
const CACHE = ${JSON.stringify(cacheName)};
const PRECACHE = ${JSON.stringify(precache)};
const SKIP = ${SKIP.toString()};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('sanctuary-') && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || SKIP.test(url.pathname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put('./', copy));
          }
          return response;
        })
        .catch(() => caches.match('./', { ignoreSearch: true })),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
`;
}
