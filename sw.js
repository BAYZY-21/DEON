// ==========================================
// نظام إدارة الديون - Service Worker
// مطور البرنامج: حارث حسيب السامرائي
// ==========================================

const CACHE_NAME = "debt-system-v4";
const STATIC_ASSETS = [
  "/DEON/index.html",
  "/DEON/manifest.json",
  "/DEON/icon-192.png",
  "/DEON/icon-512.png",
  "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"
];

// ── Install: cache static assets ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("SW: بعض الملفات لم تُخزَّن:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: Cache-first strategy ──
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.url.startsWith("chrome-extension")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("/DEON/index.html");
          }
        });
    })
  );
});
