# CI Reference

Краткая справка по пайплайну CI/CD в этом репозитории.

## Workflows

| Файл                  | Триггер                       | Что делает                                   |
| --------------------- | ----------------------------- | -------------------------------------------- |
| `ci.yaml`             | push/PR → `develop`, `master` | Quality gate: типы, линт, тесты, билд, e2e   |
| `lighthouse.yml`      | push/PR → `develop`, `master` | Аудит производительности и доступности       |
| `deploy-gh-pages.yml` | push → `master`               | Деплой собранного приложения на GitHub Pages |

## CI Job: quality

Последовательность шагов в `.github/workflows/ci.yaml`:

```
npm ci (HUSKY=0)
  → type-check   # tsc --noEmit
  → lint         # stylelint + prettier --check
  → test         # vitest run
  → build        # tsc && vite build
  → preview &    # vite preview в фоне на порту 4173
  → wait-on      # ждёт http://localhost:4173
  → test:a11y    # cypress run --spec accessibility.cy.ts
```

`HUSKY=0` — отключает git-хуки при установке зависимостей в CI.
`&` после preview — запускает сервер в фоновом процессе, чтобы не блокировать следующий шаг.
`concurrency` — отменяет предыдущий запуск на той же ветке при новом push.

## npm scripts

| Скрипт         | Команда                                  | Когда использовать             |
| -------------- | ---------------------------------------- | ------------------------------ |
| `type-check`   | `tsc --noEmit`                           | Проверка типов без сборки      |
| `lint`         | `lint:css && lint:format`                | Запуск всех проверок линта     |
| `lint:css`     | `stylelint src/styles/**/*.css`          | Только CSS                     |
| `lint:format`  | `prettier --check **/*`                  | Только форматирование          |
| `lint:fix`     | stylelint --fix + prettier --write       | Автоисправление локально       |
| `test`         | `vitest run`                             | Unit-тесты (не watch)          |
| `test:a11y`    | `cypress run --spec accessibility.cy.ts` | E2E accessibility, headless    |
| `test:cypress` | `cypress open`                           | Cypress с GUI, только локально |
| `build`        | `tsc && vite build`                      | Продакшн-сборка в `dist/`      |
| `preview`      | `vite preview`                           | Раздача `dist/` на порту 4173  |

## Порты

| Команда           | Порт |
| ----------------- | ---- |
| `npm run dev`     | 5173 |
| `npm run preview` | 4173 |

Cypress `baseUrl` настроен на `http://localhost:4173` — порт preview.

## Ключевые решения

**Почему Lighthouse отдельным workflow, а не внутри CI?**
Lighthouse требует запущенный сервер и занимает дополнительное время. Держим его отдельно, чтобы качество кода и производительность были независимыми сигналами.

**Почему `test:a11y`, а не весь Cypress?**
Базовый gate — быстрый и стабильный. Полный Cypress (`cypress run`) можно добавить как следующий этап после стабилизации спеков.

**Почему `vitest run`, а не просто `vitest`?**
Без флага `run` Vitest запускается в watch-режиме и CI-джоба никогда не завершится.

## Branch Protection (настраивается в GitHub)

Settings → Branches → Add branch ruleset:

- Ветка `master`: required checks — `CI / quality` + `Lighthouse CI / lighthouse`
- Ветка `develop`: required check — `CI / quality`

## Добавление CI в новый проект (шаблон)

1. Убедись что в `package.json` есть: `type-check`, `lint`, `test` (non-watch), `build`
2. Проверь что `prepare` не ломает `npm ci` в CI (Husky v9: просто `"prepare": "husky"`)
3. Создай `.github/workflows/ci.yml` с триггерами push/PR на нужные ветки
4. Добавь `HUSKY: 0` в env шага установки зависимостей
5. Если есть E2E — запусти сервер в фоне (`&`) + `wait-on` перед Cypress
6. Настрой branch protection с required checks
