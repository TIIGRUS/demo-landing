# PostCSS Setup

Конфигурация PostCSS с плагинами для автопрефиксов, современного CSS и минификации.

## Плагины

| Плагин               | Назначение                                                      |
| -------------------- | --------------------------------------------------------------- |
| `postcss-preset-env` | Современный CSS, обработка вложенности, кастомных медиазапросов |
| `autoprefixer`       | Вендорные префиксы для кроссбраузерной совместимости            |
| `cssnano`            | Минификация (только в продакшне)                                |

---

## Конфигурация

Файл: `postcss.config.js`

```js
export default {
    plugins: {
        'postcss-preset-env': {
            stage: 3,
            features: {
                'nesting-rules': true,
                'custom-media-queries': {
                    preserve: false,
                },
            },
        },
        autoprefixer: {},
        cssnano: process.env.NODE_ENV === 'production' ? {} : false,
    },
};
```

Vite подхватывает `postcss.config.js` автоматически — дополнительной настройки в `vite.config.ts` не требуется.

---

## Установка зависимостей

```bash
npm install -D autoprefixer postcss-preset-env cssnano
```

---

## CSS-переменные и дублирование деклараций

`postcss-preset-env` по умолчанию включает трансформацию `custom-properties`.
Это приводит к тому, что для каждой декларации с переменной **генерируется статический фолбэк** — дополнительная декларация без переменной.

### Пример

Исходный CSS:

```css
color: var(--color-text);
```

Результат в сборке (поведение по умолчанию):

```css
color: #fff; /* сгенерированный фолбэк */
color: var(--color-text); /* оригинал сохранён */
```

### Варианты настройки

#### 1. Только переменные — без фолбэков (текущий проект)

Для современных браузеров. Отключить трансформацию `custom-properties`:

```js
features: {
    'nesting-rules': true,
    'custom-media-queries': { preserve: false },
    'custom-properties': false, // отключает генерацию фолбэков
},
```

Результат:

```css
color: var(--color-text); /* только переменная */
```

#### 2. И переменные, и фолбэки

Максимальная совместимость. Ничего не добавлять — поведение по умолчанию (см. пример выше).

#### 3. Только статические значения — без переменных

Для очень старых браузеров. Включить трансформацию с `preserve: false`:

```js
features: {
    'custom-properties': { preserve: false },
},
```

Результат:

```css
color: #fff; /* переменные исчезают */
```

---

## Custom Media Queries

В `variables.css` кастомные медиазапросы объявлены через `@custom-media`.
Параметр `preserve: false` означает, что они **заменяются** на стандартные медиавыражения при сборке.

```css
/* variables.css */
@custom-media --tablet-up (width > 768px);
@custom-media --desktop-s-up (width > 1024px);
```

```css
/* Использование в любом блоке */
@media (--tablet-up) {
    .block { ... }
}
```

```css
/* После сборки */
@media (width > 768px) {
    .block { ... }
}
```

---

## Нюансы

- Фолбэки в `var(--x, fallback)` — это ручные фолбэки в исходнике, они не связаны с трансформацией `custom-properties` и остаются всегда.
- `cssnano` запускается только при `NODE_ENV=production`, то есть во время `vite build`, но не при `vite dev`.
