# CI/CD

---

## Workflows

| Файл                  | Триггер                       | Что делает                                   |
| --------------------- | ----------------------------- | -------------------------------------------- |
| `ci.yaml`             | push/PR → `develop`, `master` | Quality gate: типы, линт, тесты, билд, e2e   |
| `lighthouse.yml`      | push/PR → `develop`, `master` | Аудит производительности и доступности       |
| `deploy-gh-pages.yml` | push → `master`               | Деплой собранного приложения на GitHub Pages |

---

## CI — Quality Gate

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

- `HUSKY=0` — отключает git-хуки при установке зависимостей в CI
- `&` после preview — запускает сервер в фоне, чтобы не блокировать следующий шаг
- `concurrency` — отменяет предыдущий запуск на той же ветке при новом push

### npm скрипты

| Скрипт         | Команда                                  | Когда использовать            |
| -------------- | ---------------------------------------- | ----------------------------- |
| `type-check`   | `tsc --noEmit`                           | Проверка типов без сборки     |
| `lint`         | `lint:css && lint:format`                | Запуск всех линтеров          |
| `lint:css`     | `stylelint src/styles/**/*.css`          | Только CSS                    |
| `lint:format`  | `prettier --check **/*`                  | Только форматирование         |
| `lint:fix`     | stylelint --fix + prettier --write       | Автоисправление локально      |
| `test`         | `vitest run`                             | Unit-тесты (не watch)         |
| `test:a11y`    | `cypress run --spec accessibility.cy.ts` | E2E accessibility, headless   |
| `test:cypress` | `cypress open`                           | Cypress с GUI, локально       |
| `build`        | `tsc && vite build`                      | Продакшн-сборка в `dist/`     |
| `preview`      | `vite preview`                           | Раздача `dist/` на порту 4173 |

### Порты

| Команда           | Порт |
| ----------------- | ---- |
| `npm run dev`     | 5173 |
| `npm run preview` | 4173 |

Cypress `baseUrl` настроен на `http://localhost:4173` — порт preview.

### Ключевые решения

**Почему `test:a11y`, а не весь Cypress?** Базовый gate — быстрый и стабильный. Полный `cypress run` добавляется как следующий этап.

**Почему `vitest run`, а не `vitest`?** Без флага `run` Vitest работает в watch-режиме и CI-джоба не завершится.

---

## Lighthouse CI

Автоматическая проверка качества с помощью [@lhci/cli](https://github.com/GoogleChrome/lighthouse-ci).

### Установка

```bash
npm install --save-dev @lhci/cli
```

Добавить скрипт в `package.json`:

```json
"scripts": {
    "lighthouse": "lhci autorun"
}
```

Добавить в `.gitignore`:

```
# Lighthouse CI
.lighthouseci/
```

### Конфигурация (`.lighthouserc.json`)

```json
{
    "ci": {
        "collect": {
            "startServerCommand": "npm run preview",
            "startServerReadyPattern": "localhost",
            "url": ["http://localhost:4173/"],
            "numberOfRuns": 3
        },
        "assert": {
            "assertions": {
                "categories:accessibility": ["error", { "minScore": 0.9 }],
                "categories:best-practices": ["error", { "minScore": 0.9 }],
                "categories:seo": ["error", { "minScore": 0.9 }],
                "categories:performance": ["warn", { "minScore": 0.85 }]
            }
        },
        "upload": {
            "target": "temporary-public-storage"
        }
    }
}
```

### Пороги

| Категория      | Порог | При провале    |
| -------------- | ----- | -------------- |
| Performance    | ≥ 85  | Предупреждение |
| Accessibility  | ≥ 90  | Ошибка         |
| Best Practices | ≥ 90  | Ошибка         |
| SEO            | ≥ 90  | Ошибка         |

### Локальный запуск

```bash
npm run lighthouse
```

### Секреты репозитория

| Secret                  | Назначение                                        |
| ----------------------- | ------------------------------------------------- |
| `LHCI_GITHUB_APP_TOKEN` | Токен для публикации результатов в комментарий PR |

Установка токена: [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci) → скопировать токен → Settings → Secrets → `LHCI_GITHUB_APP_TOKEN`.

### GitHub Actions workflow (`.github/workflows/lighthouse.yml`)

```yaml
name: Lighthouse CI

on:
    push:
        branches:
            - master
            - develop
    pull_request:
        branches:
            - master
            - develop

jobs:
    lighthouse:
        runs-on: ubuntu-latest
        steps:
            - name: Checkout
              uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: 20
                  cache: npm

            - name: Install dependencies
              run: npm ci

            - name: Build
              run: npm run build

            - name: Run Lighthouse CI
              uses: treosh/lighthouse-ci-action@v11
              with:
                  configPath: .lighthouserc.json
                  uploadArtifacts: true
                  temporaryPublicStorage: true
              env:
                  LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### Pre-push хук (опционально)

Создать файл `.husky/pre-push`:

```
npm run lighthouse
```

Пропустить проверку разово:

```bash
git push --no-verify
```

**Почему Lighthouse отдельным workflow?** Lighthouse требует запущенный сервер и занимает дополнительное время. Отдельный workflow делает качество кода и производительность независимыми сигналами.

---

## GitHub Pages Deployment

### Архитектура

```
Push в master
    → GitHub Actions:
        1. Checkout
        2. Setup Node.js 20
        3. npm ci
        4. npm run build → dist/
        5. Deploy dist/ → gh-pages ветка
    → GitHub Pages публикует:
        https://tiigrus.github.io/demo-landing/
```

### Конфигурация Vite (`vite.config.ts`)

```typescript
export default {
    base: './', // Относительный путь для project pages
};
```

- Project pages (`username.github.io/repo/`) → `base: "./"`
- User/org pages (root домена) → `base: "/"`

### Workflow (`.github/workflows/deploy-gh-pages.yml`)

```yaml
name: Deploy to GitHub Pages

on:
    push:
        branches:
            - master

jobs:
    deploy:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: 20
                  cache: npm
            - run: npm ci
            - run: npm run build
            - uses: peaceiris/actions-gh-pages@v4
              with:
                  github_token: ${{ secrets.GITHUB_TOKEN }}
                  publish_dir: ./dist
```

### Первая настройка

1. **GitHub Pages:** Settings → Pages → Source: `Deploy from a branch` → Branch: `gh-pages / root` → Save
2. **Закоммитить** `.github/workflows/deploy-gh-pages.yml` и `vite.config.ts` → push в master
3. **Проверить:** Actions → "Deploy to GitHub Pages" — зелёная галка ✅

### Диагностика

**Верстка сломана / файлы не загружаются:**

- Settings → Pages → проверить Branch = `gh-pages` (не `develop`, не `main`!)

**CSS/JS не загружаются:**

- Actions → смотреть логи workflow → типичные ошибки: `npm ci`, `npm run build`, версия Node

### Checklist перед деплоем

- [ ] Settings → Pages → Branch: `gh-pages` (не dev/main!)
- [ ] `base: "./"` в `vite.config.ts`
- [ ] Локально `npm run build && npm run preview` работает
- [ ] Workflow коммичен в `.github/workflows/`

---

## Branch Protection

Settings → Branches → Add branch ruleset:

**`master`** — строгая защита:

- ✅ Require a pull request before merging
- ✅ Require status checks: `CI / quality` + `Lighthouse CI / lighthouse`
- ✅ Require branches to be up to date before merging
- ✅ Block force pushes + Restrict deletions

**`develop`** — рабочая ветка:

- ✅ Block force pushes + Restrict deletions
- ❌ Статус-чеки не требуются — иначе прямой `git push` блокируется

> Статус-чеки на `develop` блокируют даже прямой push. Достаточно требовать их только при merge в `master`.
