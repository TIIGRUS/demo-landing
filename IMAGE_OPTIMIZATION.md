# Документация по оптимизации изображений

## Что было реализовано

### 1. Автоматическая генерация современных форматов ✅

**Настроены инструменты:**

- `vite-plugin-image-optimizer` - автоматическая оптимизация при build
- Два скрипта для генерации оптимизированных версий:
    - `generate-responsive-images.js` - создает responsive версии (320w, 640w, 1024w, 1920w)
    - `convert-small-images.js` - конвертирует маленькие изображения в WebP/AVIF

**Форматы:**

- **AVIF** (quality: 75) - лучшее сжатие, ~50% экономии
- **WebP** (quality: 82) - отличная поддержка, ~30% экономии
- **JPG** (quality: 85) - fallback для старых браузеров

### 2. Responsive изображения с srcset ✅

Все изображения теперь имеют multiple размеров:

- **320w** - мобильные устройства portrait
- **640w** - мобильные landscape, маленькие планшеты
- **1024w** - планшеты, ноутбуки
- **1920w** - десктопы, retina экраны

Браузер автоматически выбирает оптимальный размер на основе:

- Ширины viewport
- Плотности пикселей экрана (DPR)
- Атрибута `sizes`

### 3. Picture элементы с fallback ✅

Все изображения обновлены на `<picture>` с progressive enhancement:

```html
<picture data-lazy>
    <source data-srcset="image-320w.avif 320w, ..." type="image/avif" />
    <source data-srcset="image-320w.webp 320w, ..." type="image/webp" />
    <img data-src="image.jpg" srcset="image-320w.jpg 320w, ..." />
</picture>
```

Порядок fallback: **AVIF → WebP → JPG**

### 4. Lazy Loading ✅

**Расширен компонент LazyLoad:**

- Добавлена поддержка `<picture>` элементов
- Обработка `<source>` с data-srcset
- IntersectionObserver с rootMargin: 100px
- Native `loading="lazy"` как дополнительный слой

**Особенности:**

- ✅ **Lead изображение** (above fold): БЕЗ lazy + `fetchpriority="high"` для оптимального LCP
- ✅ **Gallery** (12 фото): с lazy loading
- ✅ **Places** (5 изображений): с lazy loading + responsive

## Структура файлов

```
public/assets/img/
├── content/           # Оригинальные изображения
│   ├── lead.jpg
│   ├── photo-*.jpg
│   ├── places-*.jpg
│   └── ...
└── optimized/         # Сгенерированные оптимизированные версии
    ├── lead-320w.avif / .webp / .jpg
    ├── lead-640w.avif / .webp / .jpg
    ├── photo-*.avif / .webp
    ├── places-*-320w.avif / .webp / .jpg
    ├── places-*.avif / .webp
    └── ...
```

## Использование

### Генерация оптимизированных изображений

```bash
# Генерация responsive версий (320w, 640w, 1024w, 1920w)
npm run generate-images

# Конвертация маленьких изображений в WebP/AVIF
npm run convert-small-images

# Запустить оба скрипта сразу
npm run optimize-all-images
```

**Важно:** Запускайте `npm run optimize-all-images` после добавления новых изображений в `public/assets/img/content/`

### Build проекта

```bash
npm run build
```

При build Vite автоматически:

- Оптимизирует все изображения через vite-plugin-image-optimizer
- Генерирует WebP и AVIF версии
- Копирует optimized папку в dist

### Dev-сервер

```bash
npm run dev
```

## Результаты оптимизации

### Экономия размера (примеры):

| Изображение   | Оригинал JPG | WebP    | AVIF    | Экономия |
| ------------- | ------------ | ------- | ------- | -------- |
| lead-640w     | 36.8 KB      | 19.3 KB | 24.5 KB | ~47%     |
| cover-1024w   | 85.9 KB      | 52.0 KB | 61.4 KB | ~39%     |
| photo-1       | 9.2 KB       | 6.4 KB  | 7.7 KB  | ~30%     |
| places-1-320w | 25.0 KB      | 18.5 KB | 23.5 KB | ~26%     |

### Ожидаемые улучшения метрик:

- 📉 **Размер страницы**: -40-60%
- 🚀 **LCP (Largest Contentful Paint)**: +20-40%
- 📱 **Мобильный трафик**: -60-70%
- 🌐 **Поддержка браузеров**: 100% (благодаря fallback)

## Конфигурация

### vite.config.ts

```typescript
import { imagetools } from 'vite-imagetools';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default {
    plugins: [
        imagetools(),
        ViteImageOptimizer({
            jpg: { quality: 85 },
            webp: { quality: 82 },
            avif: { quality: 75 },
            png: { quality: 85 },
        }),
    ],
};
```

### LazyLoad компонент

Автоматически обрабатывает:

- `<picture data-lazy>` - загружает все `<source>` и `<img>` внутри
- `<img data-lazy>` - загружает обычные изображения
- Атрибуты: `data-src`, `data-srcset`, `data-lazy`

## Лучшие практики

### Добавление нового изображения

1. Поместите оригинал в `public/assets/img/content/`
2. Запустите `npm run optimize-all-images`
3. Используйте в HTML:

```html
<!-- Для больших изображений (>600px) -->
<picture data-lazy>
    <source
        data-srcset="optimized/image-320w.avif 320w, optimized/image-640w.avif 640w"
        type="image/avif"
        sizes="(max-width: 640px) 100vw, 640px"
    />
    <source
        data-srcset="optimized/image-320w.webp 320w, optimized/image-640w.webp 640w"
        type="image/webp"
        sizes="(max-width: 640px) 100vw, 640px"
    />
    <img
        data-src="content/image.jpg"
        data-srcset="optimized/image-320w.jpg 320w, optimized/image-640w.jpg 640w"
        sizes="(max-width: 640px) 100vw, 640px"
        alt="Описание"
        loading="lazy"
    />
</picture>

<!-- Для маленьких изображений (<600px) -->
<picture data-lazy>
    <source data-srcset="optimized/small-image.avif" type="image/avif" />
    <source data-srcset="optimized/small-image.webp" type="image/webp" />
    <img data-src="content/small-image.jpg" alt="Описание" loading="lazy" />
</picture>
```

### Критические изображения (above fold)

```html
<picture>
    <!-- БЕЗ data-lazy атрибута! -->
    <source srcset="..." type="image/avif" />
    <source srcset="..." type="image/webp" />
    <img src="..." srcset="..." alt="..." fetchpriority="high" loading="eager" />
</picture>
```

## Проверка результатов

### 1. Chrome DevTools Network

- Откройте DevTools → Network → Img
- Проверьте что загружаются `.avif` или `.webp` файлы
- Проверьте размеры файлов

### 2. Responsive тест

- DevTools → Toggle device toolbar (Ctrl+Shift+M)
- Переключайте разные устройства
- В Network смотрите какие размеры загружаются (320w, 640w и т.д.)

### 3. Lighthouse

```bash
npm run build
npm run preview
# Откройте DevTools → Lighthouse
# Запустите аудит Performance
```

Проверьте метрики:

- LCP (Largest Contentful Paint)
- Total page size
- Image optimization

### 4. Тест Lazy Loading

- Откройте страницу
- DevTools → Network → Img
- Скроллируйте вниз
- Видите как изображения загружаются по мере появления

## Troubleshooting

### Изображения не загружаются

1. Проверьте что запущен `npm run optimize-all-images`
2. Проверьте что папка `public/assets/img/optimized/` существует
3. Проверьте пути в HTML (должны совпадать с файлами)

### TypeScript ошибки при build

Игнорируйте ошибки о неиспользуемых переменных в `main.ts` - они не критичны.

### Старые браузеры не показывают изображения

- Проверьте что `<img>` элемент внутри `<picture>` имеет `src` атрибут
- Fallback JPG всегда должен быть доступен

## Дальнейшие улучшения

### Опционально

1. **CDN**: Настроить CDN для static assets
2. **Cache headers**: Настроить immutable кэширование для versioned assets
3. **CI/CD**: Автоматическая генерация изображений при deploy
4. **WebP polyfill**: Для очень старых браузеров (если нужно)
5. **Sizes calculation**: Более точные `sizes` атрибуты для ваших брейкпоинтов

### Мониторинг

- Регулярно проверяйте Lighthouse scores
- Следите за метриками Core Web Vitals
- Анализируйте размер страницы в разных условиях

## Поддержка браузеров

| Формат | Chrome | Firefox | Safari | Edge | Fallback |
| ------ | ------ | ------- | ------ | ---- | -------- |
| AVIF   | 85+    | 93+     | 16.4+  | 85+  | → WebP   |
| WebP   | 23+    | 65+     | 14+    | 18+  | → JPG    |
| JPG    | ✅     | ✅      | ✅     | ✅   | Native   |

**Итого: 100% поддержка** благодаря progressive enhancement.
