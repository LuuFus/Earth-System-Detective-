// Earth System Detective service worker: keeps map tiles and photos the site has already shown,
// so the globe and the maps come back at once on the next visit. Live data and the pages
// themselves always go to the network.

const CACHE = 'esd-tiles-v1';
const LIMIT = 1500;
const HOSTS = [
  'gibs.earthdata.nasa.gov',
  'gibs-a.earthdata.nasa.gov',
  'gibs-b.earthdata.nasa.gov',
  'gibs-c.earthdata.nasa.gov',
  'tile.openstreetmap.org',
  's3.amazonaws.com',
  'tilecache.rainviewer.com',
  'upload.wikimedia.org',
  'thumb.wikimedia.org',
  'tiles.openfreemap.org',
];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

let added = 0;
async function trim(cache) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - LIMIT; i++) await cache.delete(keys[i]);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!HOSTS.includes(url.hostname)) return;
  // GIBS "best" tiles of a dated layer never change; OSM and radar tiles change slowly.
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok && (res.type === 'cors' || res.type === 'basic')) {
        cache.put(req, res.clone());
        if (++added % 100 === 0) trim(cache);
      }
      return res;
    }),
  );
});
