# ScrollAnimations - Компонент анимаций при скролле

Компонент для создания плавных анимаций элементов при их появлении в области видимости (viewport) с использованием Intersection Observer API.

## Особенности

✅ **Intersection Observer API** - эффективное отслеживание видимости элементов
✅ **Fade-in анимации** - плавное появление блоков
✅ **Slide-in анимации** - появление с движением (4 направления)
✅ **Учет prefers-reduced-motion** - автоматическое отключение анимаций для пользователей с ограничениями
✅ **Производительность** - автоматическое прекращение отслеживания после анимации
✅ **Динамический контент** - поддержка добавления новых элементов

## Использование

### 1. Базовая инициализация

Компонент автоматически инициализируется в `main.ts`:

```typescript
import { ScrollAnimations } from './scripts/components/ScrollAnimations';

const scrollAnimations = new ScrollAnimations();
```

### 2. Разметка HTML

#### Fade-in анимация

Для плавного появления элемента:

```html
<section class="lead" data-animation="fade-in">
    <h2>Заголовок</h2>
    <p>Текст секции</p>
</section>
```

#### Slide-in анимация

Для появления элемента с движением:

```html
<!-- Slide in снизу вверх (по умолчанию) -->
<img src="image.jpg" alt="..." data-animation="slide-in" data-animation-direction="up" />

<!-- Slide in слева -->
<img src="image.jpg" alt="..." data-animation="slide-in" data-animation-direction="left" />

<!-- Slide in справа -->
<img src="image.jpg" alt="..." data-animation="slide-in" data-animation-direction="right" />

<!-- Slide in сверху -->
<img src="image.jpg" alt="..." data-animation="slide-in" data-animation-direction="down" />
```

#### Анимация с задержкой

Для создания эффекта последовательного появления:

```html
<div class="photo-grid">
    <img data-animation="fade-in" data-animation-delay="0" src="1.jpg" alt="..." />
    <img data-animation="fade-in" data-animation-delay="100" src="2.jpg" alt="..." />
    <img data-animation="fade-in" data-animation-delay="200" src="3.jpg" alt="..." />
    <img data-animation="fade-in" data-animation-delay="300" src="4.jpg" alt="..." />
</div>
```

### 3. Data-атрибуты

| Атрибут                    | Значения                      | Описание                                            |
| -------------------------- | ----------------------------- | --------------------------------------------------- |
| `data-animation`           | `fade-in`, `slide-in`         | Тип анимации (обязательный)                         |
| `data-animation-direction` | `up`, `down`, `left`, `right` | Направление для slide-in (по умолчанию: `up`)       |
| `data-animation-delay`     | Число (мс)                    | Задержка перед началом анимации (по умолчанию: `0`) |

## API

### Методы

#### `observeNewElements(elements: Element[])`

Добавляет новые элементы для отслеживания (для динамически добавляемого контента):

```typescript
const scrollAnimations = new ScrollAnimations();

// Добавляем новые элементы
const newElements = document.querySelectorAll('.dynamic-content [data-animation]');
scrollAnimations.observeNewElements(Array.from(newElements));
```

#### `destroy()`

Удаляет observer и очищает ресурсы:

```typescript
scrollAnimations.destroy();
```

## Настройки Intersection Observer

Компонент использует следующие настройки:

- **root**: `null` (viewport браузера)
- **rootMargin**: `0px 0px -100px 0px` (анимация начинается немного раньше полного появления)
- **threshold**: `0.1` (срабатывает при видимости 10% элемента)

## Производительность

### Оптимизации

1. **Однократная анимация** - элемент анимируется только один раз
2. **Автоматическое отключение отслеживания** - после анимации элемент удаляется из observer
3. **Поддержка prefers-reduced-motion** - автоматическое отключение анимаций

### Очистка памяти

Компонент автоматически:

- Прекращает отслеживание элементов после анимации
- Сохраняет ссылки на анимированные элементы в Set для предотвращения повторных анимаций
- Поддерживает метод `destroy()` для полной очистки ресурсов

## Accessibility

### Prefers-Reduced-Motion

Компонент автоматически определяет настройки пользователя:

```css
@media (prefers-reduced-motion: reduce) {
    /* Все анимации отключаются */
}
```

Если у пользователя включена настройка "Уменьшить движение":

- Все элементы сразу видимы (без анимации)
- Intersection Observer не инициализируется
- Изменение настройки отслеживается в реальном времени

## Стили

Стили организованы по методологии БЭМ:

```text
blocks/
  animations/
    animations.css              # Главный файл
    _hidden/
      animations_hidden.css     # Начальное скрытое состояние
    _visible/
      animations_visible.css    # Мгновенная видимость
    _fade-in/
      animations_fade-in.css    # Fade-in анимация
    _slide-in/
      animations_slide-in.css   # Slide-in анимации
```

### Кастомизация анимаций

Вы можете переопределить параметры анимаций в своих стилях:

```css
/* Изменить длительность */
.animate-fade-in {
    animation-duration: 1s;
}

/* Изменить timing function */
.animate-slide-in {
    animation-timing-function: ease-out;
}

/* Изменить начальное смещение для slide-in */
@keyframes slideInUp {
    from {
        transform: translateY(60px); /* было 40px */
    }
}
```

## Примеры использования

### Секция с заголовком и текстом

```html
<section class="into" data-animation="fade-in">
    <h2 class="main-title">Заголовок секции</h2>
    <p class="subtitle">Описание секции</p>
</section>
```

### Галерея изображений

```html
<div class="photo-grid">
    <img
        src="photo1.jpg"
        alt="Описание"
        data-animation="slide-in"
        data-animation-direction="left"
        data-animation-delay="0"
    />
    <img
        src="photo2.jpg"
        alt="Описание"
        data-animation="slide-in"
        data-animation-direction="right"
        data-animation-delay="100"
    />
</div>
```

### Карточки с контентом

```html
<div class="places">
    <article class="places__item" data-animation="fade-in" data-animation-delay="0">
        <h3>Место 1</h3>
        <p>Описание 1</p>
    </article>
    <article class="places__item" data-animation="fade-in" data-animation-delay="150">
        <h3>Место 2</h3>
        <p>Описание 2</p>
    </article>
</div>
```

## Браузерная поддержка

- ✅ Chrome 51+
- ✅ Firefox 55+
- ✅ Safari 12.1+
- ✅ Edge 15+

Intersection Observer API поддерживается всеми современными браузерами. Для старых браузеров можно использовать [полифилл](https://github.com/w3c/IntersectionObserver/tree/main/polyfill).

## Отладка

Для отладки можно добавить временные стили:

```css
/* Подсветка элементов с анимацией */
[data-animation] {
    outline: 2px dashed orange;
}

/* Подсветка скрытых элементов */
.animate-hidden {
    outline: 2px dashed red;
}

/* Подсветка анимированных элементов */
.animate-fade-in,
.animate-slide-in {
    outline: 2px dashed green;
}
```
