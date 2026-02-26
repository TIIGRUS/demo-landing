/**
 * VideoModal - Компонент модального окна для воспроизведения видео
 * Использует нативный HTML элемент <dialog> для семантически корректной реализации
 */
export class VideoModal {
    private dialog: HTMLDialogElement;
    private videoContainer: HTMLDivElement;
    private closeButton: HTMLButtonElement;
    // private currentVideoUrl: string | null = null;

    constructor() {
        this.dialog = this.createDialog();
        this.videoContainer = this.dialog.querySelector('.video-modal__container')!;
        this.closeButton = this.dialog.querySelector('.video-modal__close')!;

        this.setupEventListeners();
        document.body.appendChild(this.dialog);
    }

    /**
     * Создает структуру модального окна в БЭМ стиле
     */
    private createDialog(): HTMLDialogElement {
        const dialog = document.createElement('dialog');
        dialog.className = 'video-modal';
        dialog.setAttribute('aria-labelledby', 'video-modal-title');

        dialog.innerHTML = `
            <button class="video-modal__close" type="button" aria-label="Закрыть видео">
                <svg class="video-modal__close-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 8L8 24M8 8L24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
            <div class="video-modal__container"></div>
        `;

        return dialog;
    }

    /**
     * Настройка обработчиков событий
     */
    private setupEventListeners(): void {
        // Закрытие по кнопке
        this.closeButton.addEventListener('click', () => this.close());

        // Закрытие по клику на backdrop (за пределами контента)
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.close();
            }
        });

        // Закрытие по Escape (встроенная функциональность dialog)
        this.dialog.addEventListener('cancel', (e) => {
            // this.stopVideo();
            e.preventDefault(); // Предотвращаем закрытие по умолчанию, чтобы сначала остановить видео
            this.close();
        });

        // Очистка после закрытия
        this.dialog.addEventListener('close', () => {
            this.stopVideo();
        });
    }

    /**
     * Открывает модальное окно с видео
     * @param videoUrl - URL видео (YouTube, Vimeo и др.)
     * @param title - Заголовок видео для accessibility
     */
    public open(videoUrl: string, title: string = 'Видео'): void {
        // this.currentVideoUrl = videoUrl;
        const embedUrl = this.getEmbedUrl(videoUrl);

        this.videoContainer.innerHTML = `
            <h3 id="video-modal-title" class="video-modal__title visually-hidden">${title}</h3>
            <iframe
                class="video-modal__iframe"
                src="${embedUrl}?autoplay=1"
                title="${title}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            ></iframe>
        `;

        this.dialog.showModal();
        document.body.classList.add('modal-open');
    }

    /**
     * Закрывает модальное окно
     */
    public close(): void {
        if (this.dialog.open) {
            this.dialog.close();
            document.body.classList.remove('modal-open');
        }
        // this.dialog.close();
        // this.stopVideo();
        // document.body.classList.remove('modal-open');
    }

    /**
     * Останавливает воспроизведение видео
     */
    private stopVideo(): void {
        this.videoContainer.innerHTML = '';
        // this.currentVideoUrl = null;
    }

    /**
     * Преобразует обычный URL видео в embed URL
     * Поддерживает YouTube и Vimeo
     */
    private getEmbedUrl(url: string): string {
        // YouTube
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
        }

        // Vimeo
        const vimeoRegex = /vimeo\.com\/(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }

        // Если уже embed URL или другой формат - возвращаем как есть
        return url;
    }

    /**
     * Удаляет модальное окно из DOM
     */
    public destroy(): void {
        this.close();
        this.dialog.remove();
    }
}
