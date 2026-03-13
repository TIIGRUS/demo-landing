const CACHE_NAME = 'landing-cache-v1';
const BASE = self.registration.scope;
const OFFLINE_URL = `${BASE}offline.html`;

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([BASE, `${BASE}site.webmanifest`, `${BASE}offline.html`]);
        }),
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
                ),
            ),
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const isNavigation = event.request.mode === 'navigate';
    const isSameOrigin = url.origin === self.location.origin;
    const isExternal = !isSameOrigin;

    if (isExternal) {
        return;
    }

    if (isNavigation) {
        event.respondWith(
            fetch(event.request).catch(async () => {
                const cachedPage = await caches.match(BASE);
                return cachedPage || caches.match(OFFLINE_URL);
            }),
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request)
                .then((response) => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                    return response;
                })
                .catch(() => {
                    return new Response('', {
                        status: 503,
                        statusText: 'Offline',
                    });
                });
        }),
    );
});
