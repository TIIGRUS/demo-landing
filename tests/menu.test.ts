import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Menu } from "../src/scripts/components/Menu";

const CLASSNAME_MENU = "header__menu";
const CLASSNAME_BURGER = "header__burger";
const CLASSNAME_OVERLAY = "header__menu-overlay";
const CLASSNAME_BUTTON_CLOSE = "header__menu-close";

describe('Menu (DOM basics)', () => {
    // Храним экземпляр меню, чтобы можно было его удалить после теста
    let menu: Menu = null as any;

    // ═══════════════════════════════════════════════════════════════
    // ПОДГОТОВКА ПЕРЕД КАЖДЫМ ТЕСТОМ
    // ═══════════════════════════════════════════════════════════════

    beforeEach(() => {
        global.IntersectionObserver = class IntersectionObserver {
            constructor() { }
            observe() { }
            takeRecords() { return []; }
            unobserve() { }
            disconnect() { }
        } as any;
        // Создаем HTML структуру меню
        document.body.innerHTML = `
      <button
        class="header__burger"
        type="button"
        aria-label="Открыть меню навигации"
        aria-expanded="false"
        aria-controls="navigation-menu"
      >
        <span class="header__burger-line"></span>
        <span class="header__burger-line"></span>
        <span class="header__burger-line"></span>
      </button>

      <nav id="navigation-menu" class="header__menu" aria-label="Основная навигация">
        <button
          class="header__menu-close"
          type="button"
          aria-label="Закрыть меню навигации"
        >
          X
        </button>
        <ul class="header__menu-list">
          <li><a class="header__menu-link" href="#lead">Главная</a></li>
          <li><a class="header__menu-link" href="#about">О России</a></li>
        </ul>
      </nav>
    `;
    });

    // ═══════════════════════════════════════════════════════════════
    // ОЧИСТКА ПОСЛЕ КАЖДОГО ТЕСТА
    // ═══════════════════════════════════════════════════════════════

    afterEach(() => {
        // Удаляем overlay и обработчики событий
        if (menu) {
            menu.destroy();
            menu = null as any;
        }
        // Восстанавливаем прокрутку (на случай если тест упал)
        document.body.style.overflow = '';
    });

    // ═══════════════════════════════════════════════════════════════
    // ТЕСТ 1: ОТКРЫТИЕ МЕНЮ ПО КЛИКУ НА БУРГЕР
    // ═══════════════════════════════════════════════════════════════

    it('opens menu when burger button is clicked', () => {
        // Шаг 1: Создаем компонент Menu
        menu = new Menu();

        // Шаг 2: Находим кнопку бургера
        const burger = document.querySelector(`.${CLASSNAME_BURGER}`) as HTMLButtonElement;

        // Шаг 3: Кликаем на бургер (как будто пользователь нажал)
        burger.click();

        // Шаг 4: Находим меню
        const menuElement = document.querySelector(`.${CLASSNAME_MENU}`) as HTMLElement;

        // Шаг 5: ПРОВЕРКИ - что изменилось после клика?

        // Проверка 1: Меню получило класс "открыто"
        expect(menuElement.classList.contains('header__menu_opened')).toBe(true);

        // Проверка 2: Бургер получил класс "активен"
        expect(burger.classList.contains('header__burger_active')).toBe(true);

        // Проверка 3: ARIA атрибут изменился на "true" (для скринридеров)
        expect(burger.getAttribute('aria-expanded')).toBe("true");

        // Проверка 4: Текст aria-label изменился
        expect(burger.getAttribute('aria-label')).toBe('Закрыть меню');

        // Проверка 5: Прокрутка страницы заблокирована
        expect(document.body.style.overflow).toBe('hidden');

        // Проверка 6: Overlay создан и виден
        const overlay = document.querySelector(`.${CLASSNAME_OVERLAY}`);
        expect(overlay).not.toBeNull(); // Overlay существует
        expect(overlay?.classList.contains(`${CLASSNAME_OVERLAY}_visible`)).toBe(true);
    });

    // ═══════════════════════════════════════════════════════════════
    // ТЕСТ 2: ЗАКРЫТИЕ МЕНЮ ПО КЛИКУ НА КНОПКУ ЗАКРЫТИЯ
    // ═══════════════════════════════════════════════════════════════

    it('closes menu when close button is clicked', () => {
        // Создаем меню
        menu = new Menu();

        // Сначала ОТКРЫВАЕМ меню
        const burger = document.querySelector(`.${CLASSNAME_BURGER}`) as HTMLButtonElement;
        burger.click();

        // Теперь кликаем на кнопку закрытия ВНУТРИ меню
        const closeButton = document.querySelector(`.${CLASSNAME_BUTTON_CLOSE}`) as HTMLButtonElement;
        closeButton.click();

        // ПРОВЕРКИ - меню должно быть закрыто
        const menuElement = document.querySelector(`.${CLASSNAME_MENU}`) as HTMLElement;

        // Проверка 1: Класс "открыто" удален
        expect(menuElement.classList.contains('header__menu_opened')).toBe(false);

        // Проверка 2: Бургер НЕ должен быть активным
        expect(burger.classList.contains('header__burger_active')).toBe(false);

        // Проверка 3: ARIA атрибут изменился на "false" (для скринридеров)
        expect(burger.getAttribute('aria-expanded')).toBe("false");

        // Проверка 4: Текст aria-label вернулся
        expect(burger.getAttribute('aria-label')).toBe('Открыть меню');

        // Проверка 5: Прокрутка восстановлена
        expect(document.body.style.overflow).toBe('');

        // Проверка 6: Overlay скрыт
        const overlay = document.querySelector(`.${CLASSNAME_OVERLAY}`);
        expect(overlay).not.toBeNull(); // Overlay существует
        expect(overlay?.classList.contains(`${CLASSNAME_OVERLAY}_visible`)).toBe(false);
    });

    // ═══════════════════════════════════════════════════════════════
    // ТЕСТ 3: ЗАКРЫТИЕ МЕНЮ ПО КЛИКУ НА OVERLAY
    // ═══════════════════════════════════════════════════════════════

    it('closes menu when overlay is clicked', () => {
        // Создаем меню
        menu = new Menu();

        // Сначала ОТКРЫВАЕМ меню
        const burger = document.querySelector(`.${CLASSNAME_BURGER}`) as HTMLButtonElement;
        burger.click();

        // Теперь кликаем на overlay
        const overlay = document.querySelector(`.${CLASSNAME_OVERLAY}`) as HTMLElement;
        overlay.click();

        // ПРОВЕРКИ - меню должно быть закрыто (проверки аналогично тесту 2)

        const menuElement = document.querySelector(`.${CLASSNAME_MENU}`) as HTMLElement;

        // Проверка 1: Класс "открыто" удален
        expect(menuElement.classList.contains('header__menu_opened')).toBe(false);

        // Проверка 2: Бургер НЕ должен быть активным
        expect(burger.classList.contains('header__burger_active')).toBe(false);

        // Проверка 3: ARIA атрибут изменился на "false" (для скринридеров)
        expect(burger.getAttribute('aria-expanded')).toBe("false");

        // Проверка 4: Текст aria-label вернулся
        expect(burger.getAttribute('aria-label')).toBe('Открыть меню');

        // Проверка 5: Прокрутка восстановлена
        expect(document.body.style.overflow).toBe('');

        // Проверка 6: Overlay скрыт
        expect(overlay).not.toBeNull(); // Overlay существует
        expect(overlay?.classList.contains(`${CLASSNAME_OVERLAY}_visible`)).toBe(false);
    });

    // ═══════════════════════════════════════════════════════════════
    // ТЕСТ 4: ЗАКРЫТИЕ МЕНЮ ПО КЛАВИШЕ ESCAPE
    // ═══════════════════════════════════════════════════════════════

    it('closes menu when Escape key is pressed', () => {
        // Создаем меню
        menu = new Menu();

        // Сначала ОТКРЫВАЕМ меню
        const burger = document.querySelector(`.${CLASSNAME_BURGER}`) as HTMLButtonElement;
        burger.click();

        // Создаем событие нажатия клавиши Escape
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
        // Отправляем событие в document (глобально)

        document.dispatchEvent(escapeEvent);

        // ПРОВЕРКИ - меню должно быть закрыто (проверки аналогично тесту 2)

        const menuElement = document.querySelector(`.${CLASSNAME_MENU}`) as HTMLElement;

        // Проверка 1: Класс "открыто" удален
        expect(menuElement.classList.contains('header__menu_opened')).toBe(false);

        // Проверка 2: Бургер НЕ должен быть активным
        expect(burger.classList.contains('header__burger_active')).toBe(false);

        // Проверка 3: ARIA атрибут изменился на "false" (для скринридеров)
        expect(burger.getAttribute('aria-expanded')).toBe("false");

        // Проверка 4: Текст aria-label вернулся
        expect(burger.getAttribute('aria-label')).toBe('Открыть меню');

        // Проверка 5: Прокрутка восстановлена
        expect(document.body.style.overflow).toBe('');

        // Проверка 6: Overlay скрыт
        const overlay = document.querySelector(`.${CLASSNAME_OVERLAY}`);
        expect(overlay).not.toBeNull(); // Overlay существует
        expect(overlay?.classList.contains(`${CLASSNAME_OVERLAY}_visible`)).toBe(false);
    });

    // ═══════════════════════════════════════════════════════════════
    // ТЕСТ 5: ПЕРЕКЛЮЧЕНИЕ СОСТОЯНИЯ МЕНЮ (TOGGLE)
    // ═══════════════════════════════════════════════════════════════

    it('toggles menu state on repeated burger clicks', () => {
        // Создаем меню
        menu = new Menu();

        // Находим кнопку бургера
        const burger = document.querySelector(`.${CLASSNAME_BURGER}`) as HTMLButtonElement;
        const menuElement = document.querySelector(`.${CLASSNAME_MENU}`) as HTMLElement;

        // Кликаем на бургер 3 раза (открыть - закрыть - открыть)
        burger.click(); // 1-й клик - открываем
        expect(menuElement.classList.contains('header__menu_opened')).toBe(true);

        burger.click(); // 2-й клик - закрываем
        expect(menuElement.classList.contains('header__menu_opened')).toBe(false);

        burger.click(); // 3-й клик - открываем снова
        expect(menuElement.classList.contains('header__menu_opened')).toBe(true);
    });
});
