# Яндекс.Метрика

---

## Описание

Интеграция аналитики на основе:

- **Отложенной загрузки** — `tag.js` загружается только при первом взаимодействии пользователя
- **Централизованного модуля** — все вызовы `ym()` инкапсулированы в `Analytics.ts`
- **TypeScript-декларации** — глобальная функция `ym()` типизирована

---

## Структура файлов

```
src/
├── scripts/
│   └── components/
│       └── Analytics.ts           # Модуль с методами трекинга
├── types/
│   └── yandex-metrica.d.ts        # Декларация глобальной функции ym()
└── main.ts                        # Вызов setupPlaceLinks()
index.html                         # Инлайн-скрипт с отложенной загрузкой
```

---

## Счётчик в `index.html`

Скрипт размещён перед `</body>`. Загрузка `tag.js` откладывается до первого взаимодействия пользователя.

```html
<!-- Yandex.Metrika counter -->
<script type="text/javascript">
    (function () {
        window.ym =
            window.ym ||
            function () {
                (window.ym.a = window.ym.a || []).push(arguments);
            };

        var loaded = false;

        function loadMetrica() {
            if (loaded) return;
            loaded = true;

            var k = document.createElement('script');
            k.async = 1;
            k.src = 'https://mc.yandex.ru/metrika/tag.js';
            document.head.appendChild(k);

            ym(107247242, 'init', {
                webvisor: true,
                clickmap: true,
                accurateTrackBounce: true,
                trackLinks: true,
            });
        }

        var events = ['mousemove', 'scroll', 'touchstart', 'click', 'keydown'];

        events.forEach(function (event) {
            document.addEventListener(event, loadMetrica, { once: true, passive: true });
        });

        setTimeout(loadMetrica, 3000);
    })();
</script>
<!-- /Yandex.Metrika counter -->
```

### Как работает отложенная загрузка

```
Страница загрузилась
  → window.ym = функция-очередь   # вызовы ym() ставятся в ym.a
  → слушатели на 5 событий        # mousemove, scroll, touchstart, click, keydown
  → setTimeout(loadMetrica, 3000) # страховка: загрузка через 3 сек без взаимодействия

Первое взаимодействие (или 3 сек)
  → loaded = true                 # защита от двойной загрузки
  → добавляет <script> с tag.js   # асинхронно
  → ym('init', {...})             # инициализация счётчика

tag.js загрузился
  → читает ym.a                   # разбирает накопленную очередь
  → выполняет все вызовы reachGoal
```

- `window.ym` определяется **сразу** — `Analytics.ts` не упадёт с `ym is not defined`
- Флаг `loaded` защищает от двойной инициализации (6 триггеров, но `loadMetrica` выполнится один раз)
- `{ once: true, passive: true }` — слушатель самоудаляется после первого срабатывания

---

## TypeScript-декларация

Файл `src/types/yandex-metrica.d.ts`:

```typescript
declare function ym(counterId: number, event: string, ...args: unknown[]): void;
```

Подхватывается автоматически через `"include": ["src"]` в `tsconfig.json`.

---

## Модуль Analytics.ts

```typescript
const COUNTER_ID = 107247242;

function canTrack(): boolean {
    return typeof ym !== 'undefined';
}

export const analytics = {
    trackPlaceLink(placeName: string): void {
        if (canTrack()) {
            ym(COUNTER_ID, 'reachGoal', 'place_link_click', { place: placeName });
        }
    },
    trackVideoOpen(videoName: string): void {
        if (canTrack()) {
            ym(COUNTER_ID, 'reachGoal', 'video_modal_open', { title: videoName });
        }
    },
    trackFormSubmit(): void {
        if (canTrack()) {
            ym(COUNTER_ID, 'reachGoal', 'form_subscribe');
        }
    },
};
```

- `canTrack()` — дополнительная защита на случай, если `ym` не определён (например, скрипт заблокирован)

---

## Цели

| Идентификатор      | Тип                | Где срабатывает                  |
| ------------------ | ------------------ | -------------------------------- |
| `place_link_click` | JavaScript-событие | Клик по `.places__url`           |
| `video_modal_open` | JavaScript-событие | Открытие модалки видео           |
| `form_subscribe`   | JavaScript-событие | Успешная отправка формы подписки |

Цели создаются вручную в интерфейсе Яндекс.Метрики: **Настройки → Цели → Добавить цель**.

---

## Точки интеграции

### Клик по ссылкам мест — `src/main.ts`

```typescript
private setupPlaceLinks(): void {
    const placeLinks = document.querySelectorAll('.places__url');
    placeLinks.forEach((placeLink) => {
        placeLink.addEventListener('click', () => {
            const placeName =
                placeLink.closest('.places__item')
                    ?.querySelector('.places__title')
                    ?.textContent?.trim() ?? 'Unknown';
            analytics.trackPlaceLink(placeName);
        });
    });
}
```

### Открытие видео-модалки — `src/scripts/components/VideoModal.ts`

```typescript
// В методе open():
analytics.trackVideoOpen(title);
```

### Отправка формы — `src/scripts/components/Form.ts`

```typescript
// В методе setSuccessState():
analytics.trackFormSubmit();
```

---

## Lighthouse CI

Отложенная загрузка решает проблемы Lighthouse без дополнительных настроек:

- **Performance** — `tag.js` не загружается во время замера (таймаут 3 сек истекает после снятия метрик)
- **Best Practices** — нет запросов к `mc.yandex.ru` → нет third-party cookies и Issues panel

### Примечание о блокировщиках рекламы

`ERR_BLOCKED_BY_CLIENT` на `mc.yandex.ru` — ожидаемое поведение при включённом блокировщике рекламы. Данные не попадают в Метрику, но JS-ошибок нет: вызовы `ym()` просто остаются в очереди `ym.a`.

Проверять работу счётчика следует в браузере без блокировщика (или в режиме инкогнито с отключёнными расширениями).
