// Service worker minimal : ne met en cache que les fichiers de ce dépôt
// (les deux pages, les manifests, les icônes). Toute requête vers un autre
// domaine (Firebase, Leaflet, polices Google) passe directement au réseau,
// sans jamais être interceptée ni mise en cache.

const CACHE_NAME = "radar-shell-v4";
const SHELL_FILES = [
  "partage.html",
  "dashboard.html",
  "antivol-dashboard.html",
  "manifest-partage.json",
  "manifest-dashboard.json",
  "manifest-antivol.json",
  "icons/icon-partage-192.png",
  "icons/icon-partage-512.png",
  "icons/icon-dashboard-192.png",
  "icons/icon-dashboard-512.png",
  "icons/icon-antivol-192.png",
  "icons/icon-antivol-512.png"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event){
  const url = new URL(event.request.url);

  // Uniquement nos propres fichiers, en GET : cache d'abord, réseau en repli.
  const isOwnOrigin = url.origin === self.location.origin;
  const isShellFile = SHELL_FILES.some(function(f){ return url.pathname.endsWith(f); });

  if(event.request.method === "GET" && isOwnOrigin && isShellFile){
    event.respondWith(
      caches.match(event.request).then(function(cached){
        return cached || fetch(event.request);
      })
    );
  }
  // Tout le reste (Firebase, Leaflet, polices...) : on ne touche à rien,
  // le navigateur gère la requête normalement.
});
