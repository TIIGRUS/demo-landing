# ScrollAnimations

Компонент для плавных анимаций элементов при их появлении в области видимости с использованием Intersection Observer API.

## Особенности

- ⚡ **Производительность** — Intersection Observer API, однократная анимация, автоотключение отслеживания
- ♿ **Доступность** — автоматическое отключение при `prefers-reduced-motion`
- 🎨 **Гибкость** — два типа анимаций, 4 направления slide-in, настраиваемые задержки
- 🔄 **Динамический контент** — поддержка добавления новых элементов

---

## Быстрый старт

Компонент автоматически инициализируется в `main.ts`:

```typescript
import { ScrollAnimations } from './scripts/components/ScrollAnimations';

const scrollAnimations = new ScrollAnimations();
```

---

## HTML разметка

### Fade-in (плавное появление)

```html
<div data-animation="fade-in">Контент появится плавно</div>
```

### Slide-in (появление с движением)

```html
<!-- Снизу вверх (по умолчанию) -->
<img src="image.jpg" data-animation="slide-in" data-animation-direction="up" />

<!-- Слева -->
<img src="image.jpg" data-animation="slide-in" data-animation-direction="left" />

<!-- Справа -->
<img src="image.jpg" data-animation="slide-in" data-animation-direction="right" />

<!-- Сверху -->
<img src="image.jpg" data-animation="slide-in" data-animation-direction="down" />
```

### Задержка (последовательное появление)

```html
<div data-animation="fade-in" data-animation-delay="0">Элемент 1</div>
<div data-animation="fade-in" data-animation-delay="100">Элемент 2</div>
<div data-animation="fade-in" data-animation-delay="200">Элемент 3</div>
```

---

## Data-атрибуты

| Атрибут                    | Значения                      | Описание                                            |
| -------------------------- | ----------------------------- | --------------------------------------------------- |
| `data-animation`           | `fade-in`, `slide-in`         | Тип анимации (обязательный)                         |
| `data-animation-direction` | `up`, `down`, `left`, `right` | Направление для slide-in (по умолчанию: `up`)       |
| `data-animation-delay`     | Число (мс)                    | Задержка перед началом анимации (по умолчанию: `0`) |

---

## Примеры применения в проекте

```html
<!-- Секция "О России" -->
<div class="into" data-animation="fade-in"></div>

<!-- Галерея фотографий -->
<img
    class="photo-grid__image"
    data-animation="slide-in"
    data-animation-direction="up"
    data-animation-delay="0"
/>

<!-- Карточки мест -->
<div class="places__item" data-animation="fade-in" data-animation-delay="100"></div>

<!-- Видео блоки -->
<a class="video__item" data-animation="slide-in" data-animation-direction="left"></a>

<!-- Карточки фотографов -->
<figure class="comments__item" data-animation="slide-in" data-animation-direction="left"></figure>
```

---

## API

### `observeNewElements(elements: Element[])`

Добавляет элементы для отслеживания (для динамически добавляемого контента):

```typescript
const scrollAnimations = new ScrollAnimations();
const newElements = document.querySelectorAll('.dynamic-content [data-animation]');
scrollAnimations.observeNewElements(Array.from(newElements));
```

### `destroy()`

Удаляет observer и очищает ресурсы:

```typescript
scrollAnimations.destroy();
```

---

## Настройки Intersection Observer

- **root**: `null` (viewport браузера)
- **rootMargin**: `0px 0px -100px 0px` — анимация начинается чуть позже полного появления
- **threshold**: `0.1` — срабатывает при видимости 10% элемента

---

## Стили

Стили организованы по методологии БЭМ:

```
src/styles/blocks/animations/
├── animations.css                    # Главный файл
├── _hidden/animations_hidden.css     # Начальное скрытое состояние
├── _visible/animations_visible.css   # Мгновенная видимость
├── _fade-in/animations_fade-in.css   # Fade-in анимация
└── _slide-in/animations_slide-in.css # Slide-in анимации
```

### Кастомизация

```css
/* Изменить длительность */
.animate-fade-in {
    animation-duration: 1s;
}

/* Изменить начальное смещение для slide-in */
@keyframes slideInUp {
    from {
        transform: translateY(60px); /* было 40px */
    }
}
```

---

## Поддержка браузеров

- ✅ Chrome 51+
- ✅ Firefox 55+
- ✅ Safari 12.1+
- ✅ Edge 15+

Для устаревших браузеров: [полифилл Intersection Observer](https://github.com/w3c/IntersectionObserver/tree/main/polyfill).

---

## Отладка

```css
/* Подсветка элементов с анимацией */
[data-animation] {
    outline: 2px dashed orange;
}
.animate-hidden {
    outline: 2px dashed red;
}
.animate-fade-in,
.animate-slide-in {
    outline: 2px dashed green;
}
```
