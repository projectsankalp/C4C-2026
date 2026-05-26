/**
 * GraamSehat ASHA Worker App - PWA Service Worker
 * Path: /sw.js
 * Caches static files for offline app loading and routes network fetch requests.
 */

const CACHE_NAME = "graamsehat-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/src/main.jsx",
  "/src/App.jsx",
  "/src/index.css",
  "/favicon.ico"
];

// Install Event: cache core app shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: intercept network requests and return cached versions when offline
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip caching for Firebase calls or Firestore sync endpoints (always network-only)
  if (
    requestUrl.origin.includes("firebase") ||
    requestUrl.origin.includes("googleapis") ||
    event.request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset immediately
        // Fetch in background to update cache (stale-while-revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch((err) => console.log("[Service Worker] Background fetch failed (offline)"));
        return cachedResponse;
      }

      // If not in cache, fetch from network and save to cache
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If offline and request is for page, return cached index.html
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
    })
  );
});
