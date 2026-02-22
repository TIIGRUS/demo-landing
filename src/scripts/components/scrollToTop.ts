/**
 * ScrollToTop - Кнопка для прокрутки страницы наверх
 * Показывается при прокрутке более 500px
 */

export class ScrollToTop {
    private readonly VISIBILITY_CLASS: string = 'scroll-to-top_visible';
    private readonly SCROLL_THRESHOLD: number = 500; // px

    private button: HTMLButtonElement | null = null;
    private isVisible: boolean = false;


    constructor() {
        this.button = this.createButton();
        this.setEventListeners();
        this.checkVisibility(); // Проверяем сразу при загрузке
    }

    private createButton(): HTMLButtonElement {
        const button = document.createElement('button');
        button.className = 'button-base scroll-to-top';
        button.setAttribute('aria-label', 'Прокрутить страницу наверх');
        button.setAttribute('type', 'button');
        button.innerHTML = `
        <svg class="scroll-to-top__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12 19V5M5 12L12 5L19 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>`;
        document.body.appendChild(button);
        return button;
    }

    public setEventListeners(): void {
        // Отслеживание скролла с throttle для оптимизации производительности
        let ticking = false;

        if (this.button) {
            this.button.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    // Используем requestAnimationFrame для оптимизации производительности при скролле
                    // Это гарантирует, что checkVisibility будет вызван не чаще, чем 60 раз в секунду
                    window.requestAnimationFrame(() => {
                        this.checkVisibility();
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        }
    }

    private checkVisibility(): void {
        const shouldBeVisible = window.scrollY > this.SCROLL_THRESHOLD;

        if (shouldBeVisible && !this.isVisible) {
            this.show();
        } else if (!shouldBeVisible && this.isVisible) {
            this.hide();
        }
    }

    private show(): void {
        this.button?.classList.add(this.VISIBILITY_CLASS);
        this.isVisible = true;
    }

    private hide(): void {
        this.button?.classList.remove(this.VISIBILITY_CLASS);
        this.isVisible = false;
    }

    public destroy(): void {
        this.button?.remove();
        this.button = null;
    }
}
