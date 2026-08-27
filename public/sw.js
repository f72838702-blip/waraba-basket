/* Service worker Matam Waraba — PWA installable.
   Stratégie :
   - GET seulement (les server actions/POST passent directement au réseau).
   - Pages : network-first, repli cache hors-ligne.
   - Images /icons et /images : cache-first (elles changent rarement).
   Incrémenter CACHE_VERSION à chaque déploiement majeur. */
const CACHE_VERSION = "mw-v1";
const IMG_CACHE = `${CACHE_VERSION}-img`;
const PAGE_CACHE = `${CACHE_VERSION}-pages`;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Jamais de POST/PUT… (server actions Next, formulaires, Supabase).
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Supabase & co → réseau.

  // Images statiques : cache-first.
  if (url.pathname.startsWith("/icons/") || url.pathname.startsWith("/images/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMG_CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })()
    );
    return;
  }

  // Pages : network-first, repli cache si hors-ligne.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          if (res.ok) {
            const cache = await caches.open(PAGE_CACHE);
            cache.put(request, res.clone());
          }
          return res;
        } catch {
          const cache = await caches.open(PAGE_CACHE);
          const hit = await cache.match(request);
          return hit || Response.error();
        }
      })()
    );
  }
});
