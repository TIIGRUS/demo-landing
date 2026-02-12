# ScrollAnimations - Краткое руководство

## Быстрый старт

### 1. Инициализация (уже готово)

Компонент автоматически инициализирован в `main.ts`.

### 2. Добавление анимаций в HTML

#### Fade-in (плавное появление)

```html
<div data-animation="fade-in">Контент появится плавно</div>
```

#### Slide-in (появление с движением)

```html
<!-- Снизу вверх -->
<img src="image.jpg" data-animation="slide-in" data-animation-direction="up" />

<!-- Слева -->
<img src="image.jpg" data-animation="slide-in" data-animation-direction="left" />

<!-- Справа -->
<img src="image.jpg" data-animation="slide-in" data-animation-direction="right" />

<!-- Сверху -->
<img src="image.jpg" data-animation="slide-in" data-animation-direction="down" />
```

#### С задержкой (последовательное появление)

```html
<div data-animation="fade-in" data-animation-delay="0">Элемент 1</div>
<div data-animation="fade-in" data-animation-delay="100">Элемент 2</div>
<div data-animation="fade-in" data-animation-delay="200">Элемент 3</div>
```

## Примеры применения в проекте

### ✅ Секция "О России"

```html
<div class="into" data-animation="fade-in"></div>
```

### ✅ Галерея фотографий

```html
<img
    class="photo-grid__image"
    data-animation="slide-in"
    data-animation-direction="up"
    data-animation-delay="0"
/>
```

### ✅ Карточки мест

```html
<div class="places__item" data-animation="fade-in" data-animation-delay="100"></div>
```

### ✅ Видео блоки

```html
<a class="video__item" data-animation="slide-in" data-animation-direction="left"></a>
```

### ✅ Карточки фотографов

```html
<figure class="comments__item" data-animation="slide-in" data-animation-direction="left"></figure>
```

## Преимущества

- ⚡ **Производительность**: использует Intersection Observer (нативный API)
- ♿ **Доступность**: автоматически отключается при `prefers-reduced-motion`
- 🎨 **Гибкость**: 4 направления slide-in, настраиваемые задержки
- 📱 **Адаптивность**: работает на всех устройствах
- 🧹 **Оптимизация памяти**: автоматическое отключение отслеживания после анимации

## Настройки по умолчанию

- **Длительность анимации**: 0.8s
- **Timing function**: cubic-bezier(0.4, 0, 0.2, 1)
- **Порог видимости**: 10% элемента
- **Root margin**: -100px снизу (анимация начинается чуть раньше)

## Поддержка браузеров

✅ Chrome 51+
✅ Firefox 55+
✅ Safari 12.1+
✅ Edge 15+

Для старых браузеров нужен [полифилл Intersection Observer](https://github.com/w3c/IntersectionObserver/tree/main/polyfill).
