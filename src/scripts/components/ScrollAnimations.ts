/**
 * ScrollAnimations - Компонент анимаций при скролле
 * Использует Intersection Observer для отслеживания видимости элементов
 * Поддерживает fade-in и slide-in анимации с учетом prefers-reduced-motion
 */
export class ScrollAnimations {
    private observer: IntersectionObserver | null = null;
    private prefersReducedMotion: boolean;
    private animatedElements: Set<Element> = new Set();

    // Селекторы для элементов с анимациями
    private readonly fadeInSelector = '[data-animation="fade-in"]';
    private readonly slideInSelector = '[data-animation="slide-in"]';

    constructor() {
        // Проверяем настройки пользователя
        this.prefersReducedMotion = this.checkReducedMotion();

        if (this.prefersReducedMotion) {
            // Если пользователь предпочитает уменьшенные анимации - показываем всё сразу
            this.disableAnimations();
        } else {
            // Инициализируем Observer только если анимации разрешены
            this.init();
        }

        // Слушаем изменения настроек пользователя
        this.watchReducedMotionChanges();
    }

    /**
     * Проверяет предпочтения пользователя относительно анимаций
     */
    private checkReducedMotion(): boolean {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Отслеживает изменения в настройках prefers-reduced-motion
     */
    private watchReducedMotionChanges(): void {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        mediaQuery.addEventListener('change', (e) => {
            this.prefersReducedMotion = e.matches;

            if (this.prefersReducedMotion) {
                this.disableAnimations();
                this.disconnect();
            } else {
                this.init();
            }
        });
    }

    /**
     * Инициализация Intersection Observer
     */
    private init(): void {
        // Создаем observer с настройками
        this.observer = new IntersectionObserver((entries) => this.handleIntersection(entries), {
            root: null, // viewport
            rootMargin: '0px 0px -100px 0px', // Триггерим немного раньше чем элемент полностью в viewport
            threshold: 0.1, // Срабатываем когда видно 10% элемента
        });

        // Находим все элементы для анимации
        this.observeElements();
    }

    /**
     * Находит и добавляет элементы в Observer
     */
    private observeElements(): void {
        if (!this.observer) return;

        // Находим все элементы с анимациями
        const fadeInElements = document.querySelectorAll(this.fadeInSelector);
        const slideInElements = document.querySelectorAll(this.slideInSelector);

        // Добавляем их в observer
        [...fadeInElements, ...slideInElements].forEach((element) => {
            // Добавляем начальный класс для скрытия
            element.classList.add('animate-hidden');

            // Добавляем обработчик для фокусировки (для доступности)
            element.addEventListener('focusin', () => {
                if (!this.animatedElements.has(element)) {
                    this.animateElement(element);
                    this.animatedElements.add(element);
                    this.observer?.unobserve(element);
                }
            });

            this.observer!.observe(element);
        });
    }

    /**
     * Обработчик пересечений элементов с viewport
     */
    private handleIntersection(entries: IntersectionObserverEntry[]): void {
        entries.forEach((entry) => {
            // Если элемент вошел в viewport и еще не был анимирован
            if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                this.animateElement(entry.target);
                this.animatedElements.add(entry.target);

                // Прекращаем отслеживать элемент после анимации
                if (this.observer) {
                    this.observer.unobserve(entry.target);
                }
            }
        });
    }

    /**
     * Анимирует элемент на основе его типа анимации
     */
    private animateElement(element: Element): void {
        const animationType = element.getAttribute('data-animation');
        const delay = element.getAttribute('data-animation-delay') || '0';

        // Убираем класс скрытия
        element.classList.remove('animate-hidden');

        // Применяем задержку если указана
        if (delay !== '0') {
            (element as HTMLElement).style.animationDelay = `${delay}ms`;
        }

        // Добавляем класс для анимации
        switch (animationType) {
            case 'fade-in':
                element.classList.add('animate-fade-in');
                break;
            case 'slide-in':
                // Проверяем направление slide
                const direction = element.getAttribute('data-animation-direction') || 'up';
                element.classList.add('animate-slide-in', `animate-slide-in_${direction}`);
                break;
            default:
                element.classList.add('animate-fade-in');
        }
    }

    /**
     * Отключает все анимации (для случаев с prefers-reduced-motion)
     */
    private disableAnimations(): void {
        const allAnimatedElements = document.querySelectorAll(
            `${this.fadeInSelector}, ${this.slideInSelector}`,
        );

        allAnimatedElements.forEach((element) => {
            // Удаляем классы скрытия
            element.classList.remove('animate-hidden');
            // Добавляем класс мгновенной видимости
            element.classList.add('animate-visible');
        });
    }

    /**
     * Добавляет новые элементы для отслеживания (для динамически добавляемого контента)
     */
    public observeNewElements(elements: Element[]): void {
        if (!this.observer || this.prefersReducedMotion) return;

        elements.forEach((element) => {
            element.classList.add('animate-hidden');
            this.observer!.observe(element);
        });
    }

    /**
     * Отключает observer
     */
    private disconnect(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    /**
     * Удаляет observer и очищает ресурсы
     */
    public destroy(): void {
        this.disconnect();
        this.animatedElements.clear();
    }
}
