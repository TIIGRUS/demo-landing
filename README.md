# demo-landing

Demo Landing page Yandex Praktikum

## [Demo](https://tiigrus.github.io/demo-landing/)

## Технологии

- HTML5, CSS3, TypeScript
- Vite как сборщик
- Адаптивная верстка (mobile-first)
- БЭМ методология
- Оптимизация производительности (WebP/AVIF, lazy loading)

## Документация

| Файл                                                     | Описание                                     |
| -------------------------------------------------------- | -------------------------------------------- |
| [docs/image-optimization.md](docs/image-optimization.md) | WebP/AVIF, responsive srcset, lazy loading   |
| [docs/scroll-animations.md](docs/scroll-animations.md)   | Компонент анимаций на Intersection Observer  |
| [docs/video-modal.md](docs/video-modal.md)               | Модальное окно для YouTube/Vimeo видео       |
| [docs/accessibility.md](docs/accessibility.md)           | WCAG 2.1 AA, cypress-axe, 100% Lighthouse    |
| [docs/e2e-testing.md](docs/e2e-testing.md)               | Cypress: установка, структура тестов         |
| [docs/ci-cd.md](docs/ci-cd.md)                           | CI quality gate, Lighthouse CI, GitHub Pages |

### 🤖 Использование AI-инструментов

При разработке использовался **GitHub Copilot** для генерации скриптов обработки изображений, подбора параметров сжатия и написания документации.

**Все решения изучены, протестированы и полностью понятны.**

## Команды

```bash
# Установка зависимостей
npm install

# Генерация оптимизированных изображений
npm run optimize-all-images

# Запуск dev-сервера
npm run dev

# Сборка для production
npm run build
```
