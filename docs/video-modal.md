# Модальное окно для видео

## Описание

Современный компонент модального окна для воспроизведения видео, реализованный с использованием:

- **HTML5 `<dialog>` элемента** - семантически корректное и нативное модальное окно
- **БЭМ методологии** - организация стилей по правилам Block Element Modifier
- **TypeScript** - типобезопасность и современный JavaScript
- **Поддержка YouTube и Vimeo** - автоматическое определение и конвертация URL

## Структура файлов

```
src/
├── scripts/
│   └── components/
│       └── VideoModal.ts          # Основной класс компонента
├── styles/
│   └── blocks/
│       └── video-modal/
│           ├── video-modal.css                           # Основной блок
│           ├── __wrapper/video-modal__wrapper.css        # Обертка
│           ├── __container/video-modal__container.css    # Контейнер видео
│           ├── __iframe/video-modal__iframe.css          # iframe элемент
│           ├── __close/video-modal__close.css            # Кнопка закрытия
│           └── __close-icon/video-modal__close-icon.css  # Иконка закрытия
└── main.ts                        # Инициализация приложения
```

## Использование

### 1. HTML разметка

Добавьте к любому элементу data-атрибуты:

```html
<a
    href="#"
    class="video__item"
    data-video-url="https://www.youtube.com/watch?v=VIDEO_ID"
    data-video-title="Название видео"
>
    Открыть видео
</a>
```

**Атрибуты:**

- `data-video-url` - URL видео (YouTube, Vimeo или прямая ссылка на embed)
- `data-video-title` - Название видео для accessibility (опционально)

### 2. Поддерживаемые форматы URL

#### YouTube

```
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
```

#### Vimeo

```
https://vimeo.com/VIDEO_ID
https://player.vimeo.com/video/VIDEO_ID
```

### 3. Программное использование

```typescript
import { VideoModal } from './scripts/components/VideoModal';

const modal = new VideoModal();

// Открыть модальное окно
modal.open('https://www.youtube.com/watch?v=VIDEO_ID', 'Название видео');

// Закрыть модальное окно
modal.close();

// Удалить из DOM
modal.destroy();
```

## Возможности

### ✅ Семантика

- Использование нативного `<dialog>` элемента
- Корректные ARIA атрибуты
- Поддержка клавиатурной навигации

### ✅ Доступность

- Закрытие по клавише `Escape`
- Фокус-ловушка внутри модального окна
- Описательные aria-label для screen readers

### ✅ UX

- Закрытие по клику на backdrop
- Плавные CSS анимации
- Автоматическая остановка видео при закрытии
- Блокировка скролла body при открытом модальном окне

### ✅ БЭМ стили

Все стили организованы по БЭМ методологии:

```
video-modal              # Блок
  __wrapper             # Элемент: обертка
  __container           # Элемент: контейнер видео
  __iframe              # Элемент: iframe
  __close               # Элемент: кнопка закрытия
  __close-icon          # Элемент: иконка закрытия
```

## Адаптивность

Модальное окно адаптируется под разные размеры экранов:

- **Mobile (< 768px)**: padding 20px, кнопка 48x48px
- **Tablet (768px+)**: padding 40px, кнопка 56x56px
- **Desktop (1024px+)**: padding 60px, max-width 1280px

Видео всегда сохраняет aspect-ratio 16:9.

## Анимации

### Модальное окно

- Fade-in эффект (0.3s)
- Scale-in для контейнера (0.3s)

### Кнопка закрытия

- Hover эффект с увеличением
- Поворот иконки на 90° при hover
- Scale анимация при нажатии

## Технические детали

### Автозапуск видео

При открытии модального окна видео начинает воспроизводиться автоматически благодаря параметру `?autoplay=1`.

### Остановка видео

При закрытии модального окна iframe полностью удаляется из DOM, что гарантирует остановку воспроизведения.

### Предотвращение скролла

При открытом модальном окне к `body` добавляется класс `modal-open` с `overflow: hidden`.

## Браузерная совместимость

`<dialog>` элемент поддерживается во всех современных браузерах:

- Chrome 37+
- Firefox 98+
- Safari 15.4+
- Edge 79+

## Примеры

### Пример 1: YouTube видео

```html
<button
    data-video-url="https://www.youtube.com/watch?v=QCNvvUJ3xQU"
    data-video-title="Colors of Kamchatka"
>
    Смотреть видео
</button>
```

### Пример 2: Vimeo видео

```html
<a href="#" data-video-url="https://vimeo.com/81106671" data-video-title="Обсерватория">
    Открыть видео
</a>
```

## API

### VideoModal

#### Методы

##### `open(videoUrl: string, title?: string): void`

Открывает модальное окно с указанным видео.

**Параметры:**

- `videoUrl` - URL видео (YouTube, Vimeo)
- `title` - Название видео для accessibility (по умолчанию: "Видео")

##### `close(): void`

Закрывает модальное окно и останавливает видео.

##### `destroy(): void`

Удаляет модальное окно из DOM и очищает все обработчики событий.

## Кастомизация

Для изменения стилей модального окна отредактируйте соответствующие CSS файлы в `src/styles/blocks/video-modal/`.

Основные переменные для кастомизации:

- Цвет фона backdrop: `rgba(0, 0, 0, 0.9)`
- Максимальная ширина: `1280px`
- Aspect ratio: `16 / 9`
- Размер кнопки закрытия: `48px / 56px`
- Длительность анимаций: `0.3s`
