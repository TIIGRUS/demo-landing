export class LazyLoad {
    private observer: IntersectionObserver | null = null;

    constructor() {
        this.observer = null;
        this.init();
    }

    private init(): void {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(this.onIntersection.bind(this), {
                root: null,
                rootMargin: '100px 0px',
                threshold: 0.01
            });

            const lazyElements = document.querySelectorAll('[data-lazy]');
            lazyElements.forEach(el => this.observer!.observe(el));
        } else {
            // Fallback для браузеров без поддержки Intersection Observer
            this.loadAll();
        }
    }

    private onIntersection(entries: IntersectionObserverEntry[], observer: IntersectionObserver): void {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target as HTMLElement;
                this.loadElement(target);
                observer.unobserve(target);
            }
        });
    }

    private loadElement(element: HTMLElement): void {
        const src = element.getAttribute('data-src');
        const srcset = element.getAttribute('data-srcset');

        if (src) {
            // Добавляем класс loading
            element.classList.add('lazy-loading');

            // Обработка успешной загрузки
            element.addEventListener('load', () => {
                element.classList.remove('lazy-loading');
                element.classList.add('lazy-loaded');
            }, { once: true });

            // Обработка ошибки загрузки
            element.addEventListener('error', () => {
                element.classList.remove('lazy-loading');
                element.classList.add('lazy-error');
                console.error(`Failed to load image: ${src}`);
            }, { once: true });

            // Устанавливаем src и srcset
            if (srcset) {
                element.setAttribute('srcset', srcset);
                element.removeAttribute('data-srcset');
            }
            element.setAttribute('src', src);
            element.removeAttribute('data-src');
        }
    }

    private loadAll(): void {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(el => this.loadElement(el as HTMLElement));
    }
}
