# E2E Testing с Cypress

Этот проект использует Cypress для end-to-end тестирования функциональности landing page.

---

## Установка и настройка

### 1. Установка Cypress

```bash
npm install --save-dev cypress
```

### 2. Инициализация

```bash
npx cypress open
```

Это создаст структуру папок:

```
cypress/
├── e2e/          # Тесты
├── fixtures/     # Тестовые данные
└── support/      # Вспомогательные команды
```

### 3. Конфигурация TypeScript

Создайте `cypress/tsconfig.json`:

```json
{
    "compilerOptions": {
        "target": "es5",
        "lib": ["es5", "dom"],
        "types": ["cypress", "node"]
    },
    "include": ["**/*.ts"]
}
```

**Зачем:** Убирает ошибки TypeScript для глобальных функций Cypress (`describe`, `it`, `cy`).

### 4. Основной конфиг

`cypress.config.ts`:

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:5173',
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
});
```

**Важно:** `baseUrl` должен совпадать с портом вашего dev-сервера (Vite по умолчанию — 5173).

### 5. Скрипты в package.json

```json
{
    "scripts": {
        "cypress:open": "cypress open",
        "cypress:run": "cypress run",
        "test:e2e": "cypress run"
    }
}
```

---

## Запуск тестов

### Разработка (интерактивный режим)

```bash
# Терминал 1: запустите dev-сервер
npm run dev

# Терминал 2: откройте Cypress UI
npm run cypress:open
```

### CI/CD (headless режим)

```bash
npm run cypress:run
```

### Конкретный тест

```bash
npx cypress run --spec cypress/e2e/form.cy.ts
```

---

## Структура тестов

### `landing.cy.ts` — базовые smoke-тесты

Проверяет базовую загрузку и отображение страницы:

- Наличие заголовков
- Видимость навигации

### `navigation.cy.ts` — навигация и меню

- Проверка всех навигационных ссылок
- Открытие/закрытие бургер-меню
- Корректность `href` атрибутов

### `modal.cy.ts` — модальные окна видео

- Открытие модалки по клику на видео
- Закрытие кнопкой
- Закрытие по Escape
- Закрытие по клику на backdrop

### `form.cy.ts` — форма подписки

- Валидация пустого поля
- Валидация некорректного email
- Блокировка кнопки во время отправки
- Обработка результата (success/error)
- Очистка сообщений об ошибках

### `responsive.cy.ts` — адаптивный дизайн

- Проверка на разных viewport (desktop, tablet, mobile)
- Видимость бургер-меню в зависимости от разрешения
- Корректность отображения элементов

### `accessibility.cy.ts` — доступность

Подробности в [ACCESSIBILITY.md](ACCESSIBILITY.md)

---

## Базовый пример теста

```typescript
describe('Landing page', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should load the page', () => {
        cy.get('h1').should('be.visible');
    });

    it('should have navigation menu', () => {
        cy.get('nav').should('exist');
    });
});
```

---

## Best Practices

### ✅ DO

- **Используйте специфичные селекторы** — предпочитайте `data-*` атрибуты или семантические селекторы
- **Изолируйте тесты** — каждый тест должен работать независимо
- **Мокайте API** — для стабильности и скорости
- **Используйте `beforeEach`** — для повторяющейся настройки
- **Проверяйте состояния** — `.should('be.visible')`, `.should('have.class', 'active')`

### ❌ DON'T

- Не завязывайтесь на CSS-классы для стилей (они могут меняться)
- Не делайте тесты зависимыми друг от друга
- Не используйте `cy.wait(5000)` без причины — используйте `cy.wait('@alias')`
- Не тестируйте внешние API напрямую — мокайте их

---

## Полезные команды Cypress

```typescript
// Навигация
cy.visit('/');

// Селекторы
cy.get('.class');
cy.contains('текст');

// Действия
cy.click();
cy.type('text');
cy.focus();

// Проверки
cy.should('be.visible');
cy.should('have.class', 'active');
cy.should('have.attr', 'href', '#link');
cy.should('have.length', 6);

// Viewport
cy.viewport(375, 667); // iPhone SE
cy.viewport('ipad-2');

// Ожидание
cy.wait('@apiCall');
```

---

## Troubleshooting

### Тесты не видят TypeScript типы

**Решение:** Проверьте `cypress/tsconfig.json` — должен быть `"types": ["cypress", "node"]`

### Ошибка "baseUrl" is not set

**Решение:** Добавьте `baseUrl` в `cypress.config.ts` или используйте полный URL в `cy.visit()`

### Тесты падают из-за таймаута

**Решение:** Увеличьте таймаут для конкретной проверки:

```typescript
cy.get('.element', { timeout: 10000 }).should('be.visible');
```

### Элементы не кликаются

**Решение:** Используйте `{ force: true }` если элемент перекрыт:

```typescript
cy.get('.element').click({ force: true });
```

---

## CI/CD Integration

### GitHub Actions пример

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
    cypress:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                  node-version: 18
            - run: npm ci
            - run: npm run build
            - run: npm run cypress:run
```

---

## Дополнительные ресурсы

- [Официальная документация Cypress](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Примеры тестов](https://github.com/cypress-io/cypress-example-recipes)
