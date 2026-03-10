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
    private observer: IntersectionObserver | null = null;
    private sections: Map<string, Element> = new Map();

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

        // Инициализируем Scroll Spy функциональность
        this.setupScrollSpy();
    }

    /**
     * Создает overlay элемент
     */
    private createOverlay(): HTMLDivElement {
        const overlay = document.createElement('div');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.className = 'header__menu-overlay';

        if (this.menu) {
            this.menu.parentElement?.appendChild(overlay);
        }

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
        this.menu.removeAttribute('inert'); // Делаем меню доступным для взаимодействия
        this.menu.classList.add('header__menu_opened');
        this.burger.classList.add('header__burger_active');
        this.burger.setAttribute('aria-expanded', 'true');
        this.burger.setAttribute('aria-label', 'Закрыть меню');
        this.overlay.classList.add('header__menu-overlay_visible');
        document.body.style.overflow = 'hidden'; // Блокировка прокрутки
    }

    /**
     * Закрывает мобильное меню
     */
    public close(): void {
        if (!this.burger || !this.menu) return;

        this.isOpen = false;
        this.menu.setAttribute('inert', ''); // Делаем меню недоступным для взаимодействия
        this.menu.classList.remove('header__menu_opened');
        this.burger.classList.remove('header__burger_active');
        this.burger.setAttribute('aria-expanded', 'false');
        this.burger.setAttribute('aria-label', 'Открыть меню');
        this.overlay.classList.remove('header__menu-overlay_visible');
        document.body.style.overflow = ''; // Восстановление прокрутки
    }

    /**
     * ═══════════════════════════════════════════════════════════════════
     * SCROLL SPY ФУНКЦИОНАЛЬНОСТЬ - НАЧАЛО
     * ═══════════════════════════════════════════════════════════════════
     */

    /**
     * Настраивает Scroll Spy для отслеживания активной секции
     *
     * Как это работает:
     * 1. Находим все ссылки в меню с якорями (href="#section-id")
     * 2. Для каждой ссылки находим соответствующую секцию на странице
     * 3. Настраиваем IntersectionObserver - он будет следить, когда секция появляется на экране
     * 4. Когда секция становится видимой, мы помечаем соответствующую ссылку как активную
     */

    private setupScrollSpy(): void {
        if (!this.menu) return;

        // Шаг 1: Находим все ссылки в меню, которые начинаются с "#"
        // Например: <a href="#lead">, <a href="#about"> и т.д.
        const menuLinks = this.menu.querySelectorAll('a[href^="#"]');

        // Шаг 2: Для каждой ссылки находим соответствующую секцию
        menuLinks.forEach((link) => {
            // Получаем значение атрибута href, например "#lead" и убираем "#" для получения id секции
            // Можно и так, как ниже, но это менее надежно, так как href может быть не только якорем, а может содержать полный URL с якорем, например "index.html#lead"
            // const targetId = (link as HTMLAnchorElement).getAttribute('href')?.substring(1);

            // Получаем значение атрибута href, например "#lead"
            const href = link.getAttribute('href');

            // Проверяем что href существует и не пустой
            if (href && href !== '#') {
                // Убираем символ "#" из начала, получаем "lead"
                const sectionId = href.substring(1);

                // Находим элемент с этим ID на странице
                const section = document.getElementById(sectionId);

                // Если элемент найден, сохраняем его в Map для удобного доступа
                // Map будет выглядеть так: { "lead" => <section>, "about" => <section> }
                if (section) {
                    this.sections.set(sectionId, section);
                }
            }
        });

        // Шаг 3: Настраиваем IntersectionObserver
        // Это специальный API браузера, который отслеживает, когда элемент появляется на экране

        const options: IntersectionObserverInit = {
            // root: null означает, что мы следим относительно viewport (окна браузера)
            root: null,
            // '-20% 0px -60% 0px' означает:
            // - Уменьшаем зону сверху на 20% (секция должна быть чуть выше)
            // - Уменьшаем зону снизу на 60% (секция активируется раньше)
            // Это делает переключение активной ссылки более естественным
            rootMargin: '-20% 0px -60% 0px',
            // threshold - в какой момент срабатывает наблюдатель
            // [0, 0.1, 0.5, 1] означает: когда видно 0%, 10%, 50% или 100% элемента
            // Это помогает отловить момент появления секции на экране
            // threshold: [0, 0.1, 0.5, 1]
        };

        // Создаем сам IntersectionObserver с callback-функцией

        this.observer = new IntersectionObserver((entries) => {
            // entries - массив всех элементов, за которыми мы наблюдаем
            // Этот callback вызывается каждый раз, когда элемент входит/выходит из зоны видимости
            entries.forEach((entry) => {
                // entry.isIntersecting === true означает, что элемент ВИДИМ на экране
                if (entry.isIntersecting) {
                    // entry.target - это сама секция (например, <section id="lead">)
                    // entry.target.id - это "lead"
                    const id = entry.target.id;
                    // Вызываем функцию, которая пометит ссылку как активную
                    this.setActiveLink(id);
                }
            });
        }, options);

        // Шаг 4: Включаем наблюдение за всеми найденными секциями
        this.sections.forEach((section) => {
            // Говорим observer'у: "Следи за этой секцией"
            this.observer?.observe(section);
        });
    }

    /**
     * Устанавливает активное состояние для ссылки на текущую секцию
     *
     * @param sectionId - ID секции, которая сейчас видна (например, "lead", "about")
     *
     * Что делает эта функция:
     * 1. Убирает класс "активна" со ВСЕХ ссылок
     * 2. Добавляет класс "активна" только той ссылке, которая ведет на видимую секцию
     */

    private setActiveLink(sectionId: string): void {
        if (!this.menu) return;

        // Шаг 1: Убираем активный класс со всех ссылок
        // Находим все ссылки в меню с классом .header__menu-link
        const allLinks = this.menu.querySelectorAll('.header__menu-link');

        allLinks.forEach((link) => {
            // Удаляем класс, который делает ссылку активной
            link.classList.remove('header__menu-link_active');
        });

        // Шаг 2: Находим ссылку, которая ведет на текущую видимую секцию
        // Например, если sectionId = "lead", мы ищем ссылку <a href="#lead">
        const activeLink = this.menu.querySelector(`a[href="#${sectionId}"]`);

        // Если такая ссылка найдена - добавляем ей класс "активна"
        if (activeLink) {
            activeLink.classList.add('header__menu-link_active');

            // Теперь CSS подсветит эту ссылку благодаря стилям .header__menu-link_active
            // (жирный шрифт, линия слева, увеличенная яркость)
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════════
     * SCROLL SPY ФУНКЦИОНАЛЬНОСТЬ - КОНЕЦ
     * ═══════════════════════════════════════════════════════════════════
     */

    /**
     * Удаляет все обработчики событий и элементы
     */
    public destroy(): void {
        this.close();
        this.overlay.remove();

        // Отключаем наблюдение за секциями
        if (this.observer) {
            // Проходим по всем секциям и говорим observer'у: "Перестань следить"
            this.sections.forEach((section) => {
                this.observer?.unobserve(section);
            });

            // Полностью отключаем observer
            this.observer.disconnect();
        }
    }
}
