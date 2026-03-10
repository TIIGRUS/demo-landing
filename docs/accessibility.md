# Accessibility Audit — Фактически выполненные шаги

Цель: привести проект к соответствию **WCAG 2.1 AA**. Документ описывает реальные решения (а не теоретический план) и подводные камни, с которыми пришлось столкнуться.

---

## Итог

- ✅ Lighthouse Accessibility — **100%** (desktop и mobile)
- ✅ `cypress-axe` — **0 нарушений**
- ✅ Cypress a11y suite — **12/12 тестов проходят**
- ✅ Все остальные Cypress-спеки — не сломаны

---

## Фаза 1 — Инструменты

### Что пробовали

`@axe-core/cli` — несовместим с Chrome 145 (несоответствие версий ChromeDriver). Устанавливается, но падает при запуске.

### Что выбрали

`cypress-axe` — использует браузер Cypress, конфликта версий нет.

```bash
npm install --save-dev cypress-axe cypress-real-events
```

**`cypress/support/e2e.ts`**

```ts
import 'cypress-axe';
import 'cypress-real-events';
```

**`package.json`** — добавлен скрипт:

```json
"test:a11y": "cypress run --spec cypress/e2e/accessibility.cy.ts"
```

### Базовый тест (cypress/e2e/accessibility.cy.ts)

```ts
it('страница не должна иметь нарушений доступности', () => {
    cy.injectAxe();
    cy.checkA11y();
});
```

Запускаем и фиксируем **исходное состояние** — сколько нарушений и каких.

---

## Фаза 2 — HTML / ARIA

Пять конкретных исправлений в `index.html`:

### 1. Skip link — пропуск навигации

Первым дочерним элементом `<body>` добавили:

```html
<a class="skip-link" href="#main-content">Перейти к содержимому</a>
```

На `<main>` добавили `id="main-content"`.

### 2. Кнопки видео — `<a>` → `<button>`

Ссылки-обёртки карточек видео заменили на `<button>` с `aria-label`:

```html
<!-- было -->
<a class="video__item" href="#video-modal-1">...</a>

<!-- стало -->
<button class="video__item" aria-label="Смотреть видео: название">...</button>
```

Кнопка не требует `href`, её роль однозначна для скринридеров.

### 3. Подпись поля формы — `<label>`

```html
<!-- было: placeholder без label -->
<input type="email" placeholder="Ваш email" />

<!-- стало -->
<label for="email-input" class="visually-hidden">Email</label>
<input id="email-input" type="email" placeholder="Ваш email" />
```

### 4. Языковые ссылки — `aria-current`

Активная ссылка переключателя языка получила `aria-current="true"` и реальные `href`:

```html
<a href="/ru/" aria-current="true">RU</a>
<a href="/en/">EN</a>
```

### 5. Скрытое меню — атрибут `inert`

Меню навигации скрыто по умолчанию. Без `inert` скрытые кнопки остаются в Tab-порядке:

```html
<nav id="navigation-menu" inert>...</nav>
```

`inert` убирает все интерактивные элементы внутри из Tab-порядка и из дерева доступности.

---

## Фаза 3 — CSS

### 1. focus-visible для ссылок

Убрали анти-паттерн `outline: none` на `:focus`, добавили стиль только для `:focus-visible`:

**`src/styles/blocks/link/link.css`**

```css
.link:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
    border-radius: 2px;
}
```

**`src/styles/blocks/places/__url/places__url.css`** — убрали `outline: none`.

### 2. Видимый стиль ошибки в форме

Состояние `[aria-invalid="true"]` должно передаваться не только цветом:

**`src/styles/blocks/form/__input/form__input.css`**

```css
.form__input[aria-invalid='true'] {
    border-color: var(--color-error);
    border-width: 2px; /* толщина — не только цвет */
    padding-right: 40px;
    background-image: url('data:image/svg+xml,...'); /* иконка ошибки */
    background-repeat: no-repeat;
    background-position: right 12px center;
}
```

### 3. Skip link — позиционирование

**`src/styles/global.css`**

```css
.skip-link {
    position: absolute;
    top: -100%;
    left: 0;
    z-index: 9999;
    /* ...визуальные стили... */
}

.skip-link:focus {
    top: 0;
}
```

### 4. Сброс стилей для `<button>` в видео

**`src/styles/blocks/video/__item/video__item.css`**

```css
.video__item {
    border: none;
    padding: 0;
    background: transparent;
    cursor: pointer;
    text-align: left;
    /* text-decoration: none — больше не нужен, это уже не <a> */
}
```

### 5. Конфликт animate-hidden и lazy-load — ключевое исправление

**Проблема.** В `.animate-hidden` стояло `visibility: hidden`. Это приводило к двум эффектам:

1. Элементы выпадали из Tab-порядка (его потом решили отдельно — см. Фазу 5).
2. При появлении картинки срабатывали одновременно два перехода: `opacity` на родителе (animate-hidden) и `filter`/`opacity` на дочернем `<img>` (lazy-load). Результат — рывок при загрузке.

**Решение: `src/styles/blocks/animations/_hidden/animations_hidden.css`**

```css
/* Убрали visibility: hidden — только opacity */
.animate-hidden {
    opacity: 0;
    /* visibility: hidden — удалено */
}

/* Отключаем lazy-load переходы, пока родитель скрыт */
picture[data-lazy] img.animate-hidden,
.animate-hidden picture[data-lazy] img {
    filter: none;
    transition: none;
    opacity: 1;
}
```

---

## Фаза 4 — Управление фокусом

### Инсайт: нативные элементы уже всё умеют

Оба компонента, которые планировалось дорабатывать вручную, оказались уже корректны:

**`<dialog>` + `showModal()`**

- Нативный `<dialog>` автоматически перехватывает фокус внутрь при открытии.
- При нажатии Escape — закрывает и возвращает фокус на кнопку-триггер.
- Полный focus trap без единой строки кастомного JS.

**`<button>` вместо `<a>`**

- Кнопка нативно участвует в Tab-порядке.
- `Enter` и `Space` срабатывают без дополнительных обработчиков.
- Возврат фокуса при закрытии модала — нативное поведение `<dialog>`.

**`inert` в меню**
JS-компонент `Menu.ts` управляет атрибутом при открытии/закрытии:

```ts
open(): void {
  this.menu.removeAttribute('inert');
  // ...
}

close(): void {
  this.menu.setAttribute('inert', '');
  // ...
}
```

---

## Фаза 5 — Дополнительные исправления и тесты

### 1. ScrollAnimations + Tab-навигация

**Проблема.** После удаления `visibility: hidden` элементы видны в DOM, но их `opacity: 0`. Tab к ним работает, но анимация не запускается — пользователь, переходящий клавиатурой, попадает на невидимый элемент.

**Решение: `src/scripts/components/ScrollAnimations.ts`**

В `observeElements()` для каждого элемента добавили слушатель `focusin`:

```ts
element.addEventListener('focusin', () => {
    if (element.classList.contains('animate-hidden')) {
        this.animateElement(element);
    }
});
```

В `animateElement()` и `disableAnimations()` убрали атрибут `inert` если он был:

```ts
animateElement(element: Element): void {
  element.classList.remove('animate-hidden');
  element.classList.add('animate-visible');
  element.removeAttribute('inert');
}
```

### 2. Изоляция тестов формы от scroll-анимаций

**Проблема.** `<footer>` имеет `data-animation="fade-in"`, поэтому запускается со `opacity: 0`. Cypress не может надёжно прокрутить к нему при наличии lazy-load изображений, и тесты формы падали.

**Решение: `cypress/e2e/form.cy.ts`**

```ts
beforeEach(() => {
    cy.visit('/');
    // Изолируем тест от состояния scroll-анимации footer
    cy.get('.footer').invoke('removeClass', 'animate-hidden');
});
```

`invoke('removeClass', ...)` — идиоматичный способ управлять классами DOM в Cypress без риска race condition.

---

## Структура тестового файла

**`cypress/e2e/accessibility.cy.ts`** — 12 тестов в 5 блоках:

```
Accessibility tests (axe)
  ✓ страница не должна иметь нарушений доступности

Skip link
  ✓ skip link существует и становится видимым при фокусе
  ✓ skip link ведёт к основному контенту

Video accessibility
  ✓ кнопки видео доступны с клавиатуры
  ✓ модал видео открывается и закрывается

Form accessibility
  ✓ форма имеет подпись поля
  ✓ состояние ошибки визуально различимо

Language switcher
  ✓ активная ссылка имеет aria-current
  ✓ ссылки имеют реальные href

Link accessibility
  ✓ ссылки не теряют outline при фокусе
  ✓ все изображения имеют alt
  ✓ заголовки идут в правильном порядке
```

---

## Команды

```bash
# Запустить тесты доступности
npm run test:a11y

# Запустить все Cypress-тесты
npx cypress run

# Открыть Cypress UI
npx cypress open

# Запустить unit-тесты
npm test
```

---

## Ключевые выводы

| Проблема                                    | Решение                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| `@axe-core/cli` не работает с Chrome 145    | `cypress-axe` — нет зависимости от ChromeDriver                                 |
| `cy.focus()` не триггерит `:focus-visible`  | `realFocus()` из `cypress-real-events`, либо убрать `outline: none` на `:focus` |
| Элементы недоступны с Tab при `opacity: 0`  | Убрать `visibility: hidden`, добавить `focusin` listener                        |
| Два opacity-перехода при появлении картинки | CSS-правила отключают lazy-load transition пока родитель скрыт                  |
| Тесты формы зависят от scroll-анимации      | `invoke('removeClass', 'animate-hidden')` в `beforeEach`                        |
| Сложный focus trap для модала               | Нативный `<dialog>` + `showModal()` — всё из коробки                            |
