# GitHub Pages Deployment Guide

## 📋 Обзор

Этот документ описывает настройку автоматической публикации проекта на GitHub Pages через GitHub Actions.

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────┐
│  Push в master                      │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│ GitHub Actions запускает workflow:  │
│   1. Checkout код                   │
│   2. Setup Node.js 20               │
│   3. npm ci (install)               │
│   4. npm run build → dist/          │
│   5. Deploy dist/ → gh-pages ветка │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│ GitHub Pages публикует сайт:        │
│ https://username.github.io/repo/    │
└─────────────────────────────────────┘
```

---

## 📁 Структура файлов

```
.github/
└── workflows/
    └── deploy-gh-pages.yml    ← Workflow для публикации
vite.config.ts                 ← Base path для ассетов
package.json                   ← npm scripts
dist/                          ← Собранный сайт (создаётся при build)
```

---

## ⚙️ Конфигурация

### 1. Vite Config (`vite.config.ts`)

**Важный параметр: `base`**

```typescript
export default {
    base: './', // ← Относительный путь (для project pages)
    plugins: [
        // ...
    ],
} satisfies UserConfig;
```

**Правила:**

- Если сайт на project pages (`https://username.github.io/repo-name/`) → `base: "./"`
- Если сайт на user/org pages (root домена) → `base: "/"`

> **Примечание:** Раньше рекомендовалось использовать `base: "/repo-name/"`, но это может вызвать проблемы. Лучше использовать относительный путь `./`

### 2. GitHub Actions Workflow (`.github/workflows/deploy-gh-pages.yml`)

**Структура workflow:**

```yaml
name: Deploy to GitHub Pages

on: # Триггеры
    push:
        branches:
            - master # Публикуем при push в master

jobs:
    deploy: # Название задачи
        runs-on: ubuntu-latest # Виртуальная машина

        steps: # Шаги выполнения
            - name: Checkout
              uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: 20
                  cache: npm # Кэшируем npm пакеты

            - name: Install dependencies
              run: npm ci # npm clean install для CI

            - name: Build
              run: npm run build # Создаём dist/

            - name: Deploy to GitHub Pages
              uses: peaceiris/actions-gh-pages@v4
              with:
                  github_token: ${{ secrets.GITHUB_TOKEN }}
                  publish_dir: ./dist # Какую папку публиковать
```

---

## 🚀 Первая настройка

### Шаг 1: Включить GitHub Pages

1. Откройте репозиторий → **Settings** → **Pages**
2. Выберите:
    - **Source**: Deploy from a branch
    - **Branch**: `gh-pages` / `/ (root)`
3. Нажмите **Save**

### Шаг 2: Проверить Vite Config

```bash
# Убедитесь, что base установлен правильно
grep "base:" vite.config.ts
```

Должно быть:

```typescript
base: '/demo-landing/'; // Для project pages
```

### Шаг 3: Закоммитить и запушить

```bash
git add .github/workflows/deploy-gh-pages.yml vite.config.ts
git commit -m "feat: add GitHub Pages deploy workflow"
git push origin master
```

### Шаг 4: Проверить результат

1. Перейдите в **Actions** вашего репо
2. Смотрите статус workflow **"Deploy to GitHub Pages"**
3. Зелёная галка ✅ = успех
4. Сайт доступен по адресу: `https://username.github.io/repo-name/`

---

## 🔍 Диагностика проблем

### ❌ Верстка сломана / файлы не загружаются

**Частая ошибка:** GitHub Pages публикует не ту ветку!

**Решение:**

1. Откройте репо → **Settings** → **Pages**
2. Проверьте **Source**:
    - **Branch:** должна быть `gh-pages` (не `dev`, не `main`!)
    - **Folder:** `/root`
3. Нажмите **Save**

```
❌ Неправильно: Branch = develop
✅ Правильно: Branch = gh-pages
```

Если выбрана неправильная ветка, GitHub Pages публикует старый код!

### ❌ CSS/JS не загружаются

**Причина:** Workflow упал или не запустился

**Решение:**

1. Откройте **Actions** вашего репо
2. Смотрите статус workflow **"Deploy to Github Pages"**
3. Если красный крест — посмотрите логи ошибки
4. Типичные ошибки:
    - `npm ci` — проблема с `package-lock.json`
    - `npm run build` — синтаксическая ошибка в коде
    - Node.js версия — если 20 недоступна

### ❌ Workflow падает с ошибкой

1. Проверьте, что workflow прошёл успешно (Actions)
2. Очистите кэш браузера (Ctrl+Shift+Delete)
3. Дождитесь 1-2 минут (GitHub может обновлять медленно)
4. Проверьте Settings → Pages → Source

---

## 🛠️ Полезные команды

```bash
# Локальный preview перед публикацией
npm run build
npm run preview

# Просмотр статуса workflow
git log --oneline | head -5

# Переперостроить все
rm -rf dist node_modules package-lock.json
npm install
npm run build

# Проверить какой base используется
grep "base:" vite.config.ts
```

---

## 📚 Справка по Actions

| Компонент | Описание                                        |
| --------- | ----------------------------------------------- |
| `uses:`   | Используем готовый Action из GitHub Marketplace |
| `run:`    | Выполняем команду в терминале                   |
| `with:`   | Параметры для Action                            |
| `env:`    | Переменные окружения                            |
| `if:`     | Условие выполнения step                         |

### Версионирование Actions

```yaml
uses: actions/checkout@v4      # ← Версия v4 (последняя)
uses: peaceiris/actions-gh-pages@v4
```

- `@v4` — конкретная версия (рекомендуется)
- `@main` — последняя версия (не рекомендуется для production)

---

## ⚡ Оптимизация

### Кэширование npm

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
      node-version: 20
      cache: npm # ← Кэшируем зависимости
```

Ускоряет workflow на ~30-50 секунд!

### Условное выполнение

```yaml
- name: Deploy
  if: github.ref == 'refs/heads/master' # Только для master
  uses: peaceiris/actions-gh-pages@v4
```

---

## 🔒 Безопасность

### GitHub Token

```yaml
github_token: ${{ secrets.GITHUB_TOKEN }} # Встроенный токен
```

✅ **Встроенный токен `GITHUB_TOKEN`:**

- Автоматически создаётся GitHub
- Действует только для текущего репо
- Никогда не попадает в логи

❌ **Опасно:**

- Не коммитьте личные токены
- Не добавляйте в workflow напрямую
- Используйте Secrets (Settings → Secrets and variables)

---

## 📖 Дополнительные ресурсы

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)

---

## ✅ Checklist перед production

- [ ] **GitHub Pages ветка:** Settings → Pages → Branch: `gh-pages` (не dev/main!)
- [ ] `base` в `vite.config.ts` установлен на `./` (относительный путь)
- [ ] Workflow коммичен в `.github/workflows/`
- [ ] Локально `npm run build && npm run preview` работает
- [ ] Первый push запустил workflow (Actions показывает ✅)
- [ ] Сайт доступен по правильному URL
- [ ] CSS/JS/изображения загружаются корректно

---

## 🎯 Быстрая справка

```bash
# Обновить сайт:
git commit -m "some changes"
git push origin master
# Workflow запустится автоматически

# Проверить статус:
# Settings → Pages → просмотр URL

# Отключить workflow:
# Actions → Deploy to GitHub Pages → ⋯ → Disable workflow

# Или в коде:
# Закомментировать `on:` раздел в deploy-gh-pages.yml
```

---

**Последнее обновление:** Март 2026
**Проект:** demo-landing
**URL:** https://tiigrus.github.io/demo-landing/
