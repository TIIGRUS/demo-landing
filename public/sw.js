// Увеличивайте версию при изменении логики SW или списка прекешируемых файлов.
// Новое имя вызывает событие activate → удаление старого кеша → заполнение нового.
const CACHE_NAME = 'landing-cache-v1';

// Берём базовый URL из scope SW, чтобы все пути работали корректно
// как на localhost, так и на GitHub Pages (где приложение живёт по подпути,
// например: https://tiigrus.github.io/demo-landing/).
const BASE = self.registration.scope;
const OFFLINE_URL = `${BASE}offline.html`;

// ─── install ────────────────────────────────────────────────────────────────
// Прекешируем «оболочку»: главную страницу, веб-манифест и офлайн-заглушку.
// skipWaiting() активирует новый SW немедленно, не дожидаясь закрытия
// всех вкладок, работающих со старым SW.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([BASE, `${BASE}site.webmanifest`, `${BASE}offline.html`]);
        }),
    );
    self.skipWaiting();
});

// ─── activate ───────────────────────────────────────────────────────────────
// Удаляем все кеши, кроме текущего, чтобы устаревшие ресурсы не накапливались.
// clients.claim() позволяет активированному SW взять под контроль уже открытые
// страницы без перезагрузки.
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

// ─── fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const isNavigation = event.request.mode === 'navigate';
    const isSameOrigin = url.origin === self.location.origin;
    const isExternal = !isSameOrigin;

    // Сторонние запросы (Яндекс Метрика, YouTube, Vimeo и т.д.) отдаём
    // браузеру напрямую — SW не должен в них вмешиваться.
    if (isExternal) {
        return;
    }

    // Навигационные запросы (HTML-страницы): стратегия «сначала сеть»,
    // чтобы пользователь всегда получал свежую разметку при наличии интернета.
    // При неудаче — пробуем закешированную главную страницу, затем офлайн-заглушку.
    if (isNavigation) {
        event.respondWith(
            fetch(event.request).catch(async () => {
                const cachedPage = await caches.match(BASE);
                return cachedPage || caches.match(OFFLINE_URL);
            }),
        );
        return;
    }

    // Статические ресурсы (JS, CSS, изображения, шрифты): стратегия «сначала кеш»
    // для мгновенной загрузки. При промахе — запрашиваем сеть и сохраняем ответ,
    // чтобы следующий запрос обслуживался из кеша. Ответы с ошибкой (например, 404)
    // возвращаются вызывающему коду, но не кешируются. Сетевые ошибки возвращают
    // статус 503, чтобы цепочка промисов не завершалась исключением.
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
