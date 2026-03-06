# Lighthouse CI

Автоматическая проверка качества страницы с помощью [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci).

## Установка

### 1. Установить `@lhci/cli`

```bash
npm install --save-dev @lhci/cli
```

### 2. Добавить скрипт в `package.json`

```json
"scripts": {
    "lighthouse": "lhci autorun"
}
```

### 3. Создать `.lighthouserc.json` в корне проекта

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

### 4. Добавить в `.gitignore`

```
# Lighthouse CI
.lighthouseci/
```

### 5. Создать GitHub Actions workflow

Файл `.github/workflows/lighthouse.yml`:

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

### 6. Настроить PR-комментарии (опционально)

1. Установить [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci) на репозиторий
2. Скопировать выданный токен
3. Добавить в **Settings → Secrets → Actions** репозитория:
    - **Name:** `LHCI_GITHUB_APP_TOKEN`
    - **Secret:** токен из шага выше

### 7. Настроить pre-push hook (опционально)

Создать файл `.husky/pre-push`:

```
npm run lighthouse
```

---

## Локальный запуск

```bash
npm run lighthouse
```

Запускает сборку, поднимает `vite preview` и прогоняет Lighthouse 3 раза. В терминале отображается таблица с баллами и ссылка на публичный отчёт.

## Пороги

| Категория      | Порог | При провале    |
| -------------- | ----- | -------------- |
| Performance    | ≥ 85  | Предупреждение |
| Accessibility  | ≥ 90  | Ошибка         |
| Best Practices | ≥ 90  | Ошибка         |
| SEO            | ≥ 90  | Ошибка         |

## GitHub Actions

Workflow запускается автоматически при:

- `push` в ветки `master` или `develop`
- `pull_request` в ветки `master` или `develop`

Результаты появляются в виде комментария к PR (требует установленного [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci)).

## Pre-push hook

Перед каждым `git push` автоматически запускается `npm run lighthouse`.

Пропустить проверку разово:

```bash
git push --no-verify
```

## Конфигурация

Настройки находятся в `.lighthouserc.json` — пороги, URL, количество прогонов.

## Секреты репозитория

| Secret                  | Назначение                                        |
| ----------------------- | ------------------------------------------------- |
| `LHCI_GITHUB_APP_TOKEN` | Токен для публикации результатов в комментарий PR |
