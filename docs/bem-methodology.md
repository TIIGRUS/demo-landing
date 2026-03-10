# Настройка БЭМ методологии

Это руководство описывает настройку инструментов для работы с БЭМ (Блок, Элемент, Модификатор) методологией в проекте.

## Структура БЭМ имен

### Базовые правила

```
блок                    → block
блок с дефисом          → photo-grid
элемент                 → block__element
элемент с дефисом       → block__element-title
модификатор блока       → block_modifier
модификатор элемента    → block__element_modifier
модификатор со значением → block_size_l, menu_size_mobile
```

### Примеры из проекта

**Правильно:**

- `lead` — блок
- `lead__title` — элемент блока
- `lead__image-cover` — элемент с дефисом
- `main-title_size_l` — блок с модификатором
- `menu_size_tablet` — модификатор с подчеркиванием в значении
- `container_size_m` — модификатор блока

**Неправильно:**

- `Lead` — заглавная буква
- `lead-title` — элемент через дефис вместо `__`
- `lead__title__subtitle` — множественные уровни элементов

## Конфигурация Stylelint

### Файл `.stylelintrc.json`

```json
{
    "extends": "stylelint-config-standard",
    "rules": {
        "selector-class-pattern": "^[a-z]([a-z0-9-]*[a-z0-9])?(__[a-z]([a-z0-9-]*[a-z0-9])?)?(_[a-z0-9]+(_[a-z0-9]+)*)?$",
        "custom-property-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$"
    }
}
```

### Объяснение паттернов

#### `selector-class-pattern` — БЭМ классы

Регулярное выражение разбито на три части:

1. **Блок:** `^[a-z]([a-z0-9-]*[a-z0-9])?`
    - Начинается с буквы
    - Может содержать буквы, цифры, дефисы
    - Примеры: `block`, `photo-grid`, `main-title`

2. **Элемент (опционально):** `(__[a-z]([a-z0-9-]*[a-z0-9])?)?`
    - Отделяется двумя подчеркиваниями `__`
    - Может содержать дефисы
    - Примеры: `__title`, `__element-name`, `__image-cover`

3. **Модификатор (опционально):** `(_[a-z0-9]+(_[a-z0-9]+)*)?`
    - Отделяется одним подчеркиванием `_`
    - Может содержать дополнительные подчеркивания для составных значений
    - Примеры: `_visible`, `_size_m`, `_size_mobile`

#### `custom-property-pattern` — CSS переменные

```
^[a-z][a-z0-9]*(-[a-z0-9]+)*$
```

- Только нижний регистр
- Дефисы для разделения слов
- Примеры: `--main-color`, `--font-size`, `--transition-duration`

## Интеграция с другими инструментами

### EditorConfig (`.editorconfig`)

EditorConfig — это файл конфигурации для настройки стиля кода на уровне редактора. Он поддерживается большинством современных IDE и редакторов (VS Code, WebStorm, Sublime Text и др.).

**Зачем нужен:**

- Обеспечивает единый стиль кода для всей команды
- Работает автоматически при открытии файлов
- Независим от конкретного редактора или IDE

**Конфигурация проекта:**

```ini
root = true

[*]
indent_style = space
indent_size = 4
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

**Объяснение параметров:**

- `root = true` — указывает, что это корневой конфиг (поиск выше не требуется)
- `[*]` — применяется ко всем файлам
- `indent_style = space` — использовать пробелы вместо табов
- `indent_size = 4` — размер отступа 4 пробела
- `end_of_line = lf` — Unix-стиль переводов строк (совместимость между OS)
- `charset = utf-8` — кодировка UTF-8
- `trim_trailing_whitespace = true` — удалять пробелы в конце строк
- `insert_final_newline = true` — добавлять перевод строки в конце файла

**Расширенная конфигурация (опционально):**

Можно задавать разные правила для разных типов файлов:

```ini
[*.{css,html}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false

[*.{js,ts}]
indent_size = 2
```

### Prettier (`.prettierrc`)

Автоформатирование кода:

```json
{
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "useTabs": false,
    "printWidth": 100,
    "htmlWhitespaceSensitivity": "ignore"
}
```

### Husky + lint-staged

Автоматическая проверка при коммитах через Git hooks.

**Установка:**

```bash
npm install -D stylelint-order husky lint-staged
```

**Настройка в `package.json`:**

```json
{
    "lint-staged": {
        "*.css": ["stylelint --fix", "prettier --write"],
        "*.html": "prettier --write",
        "*.{js,ts}": "prettier --write"
    }
}
```

## Структура файлов

Файлы располагаются по БЭМ структуре:

```
src/styles/blocks/
  block-name/
    block-name.css
    __element/
      block-name__element.css
    _modifier/
      block-name_modifier.css
```

**Пример:**

```
menu/
  menu.css
  __item/
    menu__item.css
  _size_tablet/
    menu_size_tablet.css
  _size_mobile/
    menu_size_mobile.css
```

## Запуск проверки

**Проверка всех CSS файлов:**

```bash
npx stylelint "src/**/*.css"
```

**Автоисправление:**

```bash
npx stylelint "src/**/*.css" --fix
```

**Проверка конкретного файла:**

```bash
npx stylelint src/styles/blocks/menu/menu.css
```

## Типичные ошибки

### 1. Неправильное именование модификатора

```css
/* ❌ Неправильно */
.menu--size-tablet {
}

/* ✅ Правильно */
.menu_size_tablet {
}
```

### 2. Множественные уровни элементов

```css
/* ❌ Неправильно */
.block__element__subelement {
}

/* ✅ Правильно */
.block__subelement {
}
```

### 3. Использование camelCase

```css
/* ❌ Неправильно */
.mainTitle {
}

/* ✅ Правильно */
.main-title {
}
```

## Отключение правил для конкретных случаев

Если нужно пропустить проверку для отдельной строки:

```css
/* stylelint-disable-next-line selector-class-pattern */
.legacy-class-name {
}
```

Для всего файла:

```css
/* stylelint-disable selector-class-pattern */
.old-style {
}
.another-old {
}
/* stylelint-enable selector-class-pattern */
```

## Дополнительные ресурсы

- [БЭМ методология](https://ru.bem.info/methodology/)
- [Stylelint документация](https://stylelint.io/)
- [Naming conventions в БЭМ](https://en.bem.info/methodology/naming-convention/)
