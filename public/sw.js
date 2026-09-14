const CACHE_VERSION = "drops-v1";
const PAGES_CACHE = `${CACHE_VERSION}-pages`;
const ASSETS_CACHE = `${CACHE_VERSION}-assets`;
const IMAGES_CACHE = `${CACHE_VERSION}-images`;

// Le cache hors ligne est désactivé sur localhost : intercepter les fichiers
// _next/static casse le Fast Refresh du serveur de dev (les chunks changent
// de nom à chaque recompilation, le cache-first du Service Worker servait
// parfois une ancienne version ou interférait avec leur chargement — constaté
// en direct via des erreurs 404/MIME au redémarrage du serveur). Les
// notifications push (install/push/notificationclick plus bas) restent
// actives partout, y compris en local, pour pouvoir les tester avant
// déploiement.
const isLocalDev = self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1";

// Pages consultables hors ligne (voir MISSION V12, point 2) : accueil,
// plateformes, catégories — mises en cache dès l'installation pour être
// disponibles même sans connexion au tout premier lancement hors ligne.
const PRECACHE_PAGES = ["/", "/platforms", "/categories"];

self.addEventListener("install", (event) => {
  if (!isLocalDev) {
    event.waitUntil(
      caches.open(PAGES_CACHE).then((cache) => cache.addAll(PRECACHE_PAGES)).catch(() => { /* précaching best-effort : une offre indisponible au premier lancement ne doit pas bloquer l'installation */ }),
    );
  }
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => !key.startsWith(CACHE_VERSION)).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

function isNavigationRequest(request) {
  return request.mode === "navigate" || (request.method === "GET" && request.headers.get("accept")?.includes("text/html"));
}

function isImageRequest(request) {
  return request.destination === "image" || request.url.includes("/_next/image");
}

function isStaticAsset(request) {
  return request.url.includes("/_next/static/");
}

// Jamais mis en cache : routes admin/auth/API et tout ce qui vient de
// Supabase — ces données doivent toujours être fraîches, jamais servies
// depuis un cache hors ligne (session, favoris, notifications...).
function isNeverCache(url) {
  return url.pathname.startsWith("/admin") || url.pathname.startsWith("/api") || url.pathname.startsWith("/account") || url.pathname.startsWith("/auth") || url.hostname.endsWith(".supabase.co");
}

self.addEventListener("fetch", (event) => {
  if (isLocalDev) return;
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (isNeverCache(url)) return;

  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(ASSETS_CACHE).then((cache) => cache.put(request, clone));
        return response;
      })),
    );
    return;
  }

  if (isImageRequest(request)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(IMAGES_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      }),
    );
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(PAGES_CACHE).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => caches.match(request).then((cached) => cached || caches.match("/"))),
    );
  }
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { /* payload non-JSON ignoré */ }
  const title = data.title || "DROPS";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});
