# Путешествия по России

> Адаптивный лендинг о самых красивых местах России

[![CI](https://github.com/TIIGRUS/demo-landing/workflows/CI/badge.svg)](https://github.com/TIIGRUS/demo-landing/actions/workflows/ci.yaml)
[![Lighthouse CI](https://github.com/TIIGRUS/demo-landing/workflows/Lighthouse%20CI/badge.svg)](https://github.com/TIIGRUS/demo-landing/actions/workflows/lighthouse.yml)
[![License](https://img.shields.io/badge/license-ISC-blue)](LICENSE)

[🚀 Live Demo](https://tiigrus.github.io/demo-landing/) &nbsp;|&nbsp; [🎨 Figma макет](https://www.figma.com/design/o0s71WMv4hulIkmBnNJOzc/Travel_Russia-_-desktop---mobile?node-id=28503-0&t=iSJPW7VuU35BFsBz-1)

## 📸 Скриншот

<!-- TODO: добавить скриншот docs/preview.png -->

![Preview](docs/preview.png)

## ✨ Особенности

- Строгая **БЭМ Nested** методология
- Адаптивная верстка (mobile-first)
- Изображения в **AVIF/WebP** с responsive `srcset`
- **100% Accessibility** (WCAG 2.1 AA, Lighthouse)
- Performance Score 90+
- Скролл-анимации на **Intersection Observer API**
- Видео-модал для YouTube/Vimeo (HTML5 `<dialog>`)
- Яндекс.Метрика с отложенной загрузкой
- Lazy loading изображений
- Git-хуки (Husky): автоформатирование перед коммитом
- Автоматическое тестирование (unit + E2E + accessibility)
- CI/CD с GitHub Actions

## 🛠 Технологии

| Категория          | Инструменты                                                |
| ------------------ | ---------------------------------------------------------- |
| Разметка и стили   | HTML5, CSS3 (Grid, Flexbox, Custom Properties, Nesting)    |
| Скрипты            | TypeScript, Vanilla JS (ES6+)                              |
| Сборщик            | Vite 7, vite-imagetools, vite-plugin-image-optimizer       |
| PostCSS            | postcss-preset-env (stage 3), autoprefixer, cssnano        |
| Unit-тесты         | Vitest, jsdom                                              |
| E2E тесты          | Cypress 15, cypress-axe, cypress-real-events               |
| Качество кода      | TypeScript strict, Stylelint, Prettier                     |
| Git-хуки           | Husky, lint-staged                                         |
| Изображения        | Sharp (скрипты конвертации AVIF/WebP)                      |
| Производительность | Lighthouse CI (@lhci/cli)                                  |
| CI/CD              | GitHub Actions (CI, Lighthouse CI, Deploy to GitHub Pages) |

## 🚀 Быстрый старт

### Установка

```bash
npm install
```

### Разработка

```bash
npm run dev
```

### Production сборка

```bash
npm run build
npm run preview
```

## 📦 Команды

| Команда                       | Описание                                  |
| ----------------------------- | ----------------------------------------- |
| `npm run dev`                 | Запуск dev-сервера                        |
| `npm run build`               | Production сборка (tsc + vite)            |
| `npm run preview`             | Предпросмотр production сборки            |
| `npm run test`                | Запуск unit-тестов (Vitest)               |
| `npm run test:cypress`        | Открыть Cypress (интерактивный режим)     |
| `npm run test:a11y`           | E2E тест доступности (cypress-axe)        |
| `npm run type-check`          | Проверка типов TypeScript                 |
| `npm run lint`                | Проверка CSS (Stylelint) + форматирование |
| `npm run lint:fix`            | Автоисправление CSS и форматирования      |
| `npm run optimize-all-images` | Генерация AVIF/WebP изображений (Sharp)   |
| `npm run lighthouse`          | Запуск Lighthouse CI                      |

## 📁 Структура проекта

```
demo-landing/
├── .github/
│   └── workflows/
│       ├── ci.yaml               # Quality gate: types, lint, tests, build, E2E
│       ├── lighthouse.yml        # Lighthouse CI аудит
│       └── deploy-gh-pages.yml   # Деплой на GitHub Pages
├── cypress/
│   ├── e2e/                      # E2E тесты (accessibility, form, modal…)
│   └── support/
├── docs/                         # Документация по компонентам
├── public/
│   └── assets/
│       ├── fonts/
│       └── img/optimized/        # AVIF/WebP изображения
├── scripts/                      # Скрипты генерации изображений (Sharp)
├── src/
│   ├── scripts/
│   │   ├── components/           # Menu, Form, VideoModal, ScrollAnimations…
│   │   └── utils/                # api.ts, validators.ts
│   ├── styles/
│   │   └── blocks/               # БЭМ-блоки
│   └── types/
├── tests/                        # Unit-тесты (Vitest)
├── index.html
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── postcss.config.js
└── cypress.config.ts
```

## 🌐 Браузерная поддержка

Современные браузеры через `postcss-preset-env` (stage 3) и `autoprefixer`:

| Браузер | Версия  |
| ------- | ------- |
| Chrome  | 2 посл. |
| Firefox | 2 посл. |
| Safari  | 2 посл. |
| Edge    | 2 посл. |

## 📚 Документация

| Файл                                                     | Описание                                                |
| -------------------------------------------------------- | ------------------------------------------------------- |
| [docs/accessibility.md](docs/accessibility.md)           | WCAG 2.1 AA, cypress-axe, 100% Lighthouse Accessibility |
| [docs/bem-methodology.md](docs/bem-methodology.md)       | БЭМ Nested: структура, именование, инструменты          |
| [docs/ci-cd.md](docs/ci-cd.md)                           | CI quality gate, Lighthouse CI, деплой на GitHub Pages  |
| [docs/e2e-testing.md](docs/e2e-testing.md)               | Cypress: установка, структура тестов, запуск            |
| [docs/git-workflow.md](docs/git-workflow.md)             | Git-стратегия, ветки develop/master                     |
| [docs/image-optimization.md](docs/image-optimization.md) | WebP/AVIF, responsive srcset, lazy loading              |
| [docs/postcss-setup.md](docs/postcss-setup.md)           | PostCSS: preset-env (stage 3), autoprefixer, cssnano    |
| [docs/scroll-animations.md](docs/scroll-animations.md)   | Компонент анимаций на Intersection Observer API         |
| [docs/video-modal.md](docs/video-modal.md)               | Модальное окно для YouTube/Vimeo (HTML5 `<dialog>`)     |
| [docs/yandex-metrica.md](docs/yandex-metrica.md)         | Яндекс.Метрика: отложенная загрузка, аналитика          |

## 📝 Лицензия

[ISC](LICENSE)

## 👤 Автор

**TIIGRUS** — [github.com/TIIGRUS](https://github.com/TIIGRUS)

---

### 🤖 Использование AI-инструментов

При разработке использовался **GitHub Copilot** для генерации скриптов обработки изображений, подбора параметров сжатия и написания документации.

**Все решения изучены, протестированы и полностью понятны.**
