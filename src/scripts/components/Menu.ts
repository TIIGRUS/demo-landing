/**
 * Menu - Компонент мобильного гамбургер-меню
 * Управляет открытием/закрытием мобильного навигационного меню
 */
export class Menu {
    private burger: HTMLButtonElement | null;
    private menu: HTMLElement | null;
    private menuCloseBtn: HTMLButtonElement | null;
    private overlay: HTMLDivElement;
    private isOpen: boolean = false;

    constructor() {
        this.burger = document.querySelector('.header__burger');
        this.menu = document.querySelector('.header__menu');
        this.menuCloseBtn = document.querySelector('.header__menu-close');
        this.overlay = this.createOverlay();

        if (!this.burger || !this.menu) {
            console.warn('Menu: burger button or menu element not found');
            return;
        }

        this.setupEventListeners();
    }

    /**
     * Создает overlay элемент
     */
    private createOverlay(): HTMLDivElement {
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    /**
     * Настройка обработчиков событий
     */
    private setupEventListeners(): void {
        if (!this.burger || !this.menu) return;

        // Открытие/закрытие по клику на кнопку
        this.burger.addEventListener('click', () => this.toggle());

        // Закрытие по клику на кнопку закрытия в меню
        if (this.menuCloseBtn) {
            this.menuCloseBtn.addEventListener('click', () => this.close());
        }

        // Закрытие по клику на overlay
        this.overlay.addEventListener('click', () => this.close());

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Закрытие при изменении размера окна (если переходим к desktop)
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.isOpen) {
                this.close();
            }
        });

        // Закрытие при клике на навигационные ссылки
        const menuLinks = this.menu.querySelectorAll('a[href^="#"]');
        menuLinks.forEach((link) => {
            link.addEventListener('click', () => {
                // Закрываем меню с небольшой задержкой для плавности
                setTimeout(() => this.close(), 100);
            });
        });
    }

    /**
     * Переключает состояние меню
     */
    public toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Открывает мобильное меню
     */
    public open(): void {
        if (!this.burger || !this.menu) return;

        this.isOpen = true;
        this.menu.classList.add('header__menu_opened');
        this.burger.classList.add('header__burger_active');
        this.burger.setAttribute('aria-expanded', 'true');
        this.burger.setAttribute('aria-label', 'Закрыть меню');
        this.overlay.classList.add('menu-overlay_visible');
        document.body.style.overflow = 'hidden'; // Блокировка прокрутки
    }

    /**
     * Закрывает мобильное меню
     */
    public close(): void {
        if (!this.burger || !this.menu) return;

        this.isOpen = false;
        this.menu.classList.remove('header__menu_opened');
        this.burger.classList.remove('header__burger_active');
        this.burger.setAttribute('aria-expanded', 'false');
        this.burger.setAttribute('aria-label', 'Открыть меню');
        this.overlay.classList.remove('menu-overlay_visible');
        document.body.style.overflow = ''; // Восстановление прокрутки
    }

    /**
     * Удаляет все обработчики событий и элементы
     */
    public destroy(): void {
        this.close();
        this.overlay.remove();
    }
}
