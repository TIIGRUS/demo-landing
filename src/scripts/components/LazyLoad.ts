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
                threshold: 0.01,
            });

            const lazyElements = document.querySelectorAll('[data-lazy]');
            lazyElements.forEach((el) => this.observer!.observe(el));
        } else {
            // Fallback для браузеров без поддержки Intersection Observer
            this.loadAll();
        }
    }

    private onIntersection(
        entries: IntersectionObserverEntry[],
        observer: IntersectionObserver,
    ): void {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const target = entry.target as HTMLElement;
                this.loadElement(target);
                observer.unobserve(target);
            }
        });
    }

    private loadElement(element: HTMLElement): void {
        // Проверяем, является ли элемент <picture> или <img>
        if (element.tagName === 'PICTURE') {
            this.loadPicture(element as HTMLPictureElement);
        } else if (element.tagName === 'IMG') {
            this.loadImage(element as HTMLImageElement);
        }
    }

    private loadPicture(picture: HTMLPictureElement): void {
        // Загружаем все <source> элементы
        const sources = picture.querySelectorAll('source[data-srcset]');
        sources.forEach((source) => {
            const srcset = source.getAttribute('data-srcset');
            if (srcset) {
                source.setAttribute('srcset', srcset);
                source.removeAttribute('data-srcset');
            }
        });

        // Загружаем <img> внутри <picture>
        const img = picture.querySelector('img');
        if (img) {
            this.loadImage(img);
        }
    }

    private loadImage(img: HTMLImageElement): void {
        const src = img.getAttribute('data-src');
        const srcset = img.getAttribute('data-srcset');

        if (src) {
            // Добавляем класс loading
            img.classList.add('lazy-loading');

            // Обработка успешной загрузки
            img.addEventListener(
                'load',
                () => {
                    img.classList.remove('lazy-loading');
                    img.classList.add('lazy-loaded');
                },
                { once: true },
            );

            // Обработка ошибки загрузки
            img.addEventListener(
                'error',
                () => {
                    img.classList.remove('lazy-loading');
                    img.classList.add('lazy-error');
                    console.error(`Failed to load image: ${src}`);
                },
                { once: true },
            );

            // Устанавливаем src и srcset
            if (srcset) {
                img.setAttribute('srcset', srcset);
                img.removeAttribute('data-srcset');
            }
            img.setAttribute('src', src);
            img.removeAttribute('data-src');
        }
    }

    private loadAll(): void {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach((el) => this.loadElement(el as HTMLElement));
    }
}
