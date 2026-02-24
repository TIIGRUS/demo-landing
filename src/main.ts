import { VideoModal } from './scripts/components/VideoModal';
import { Menu } from './scripts/components/Menu';
import { ScrollAnimations } from './scripts/components/ScrollAnimations';
import { LazyLoad } from './scripts/components/LazyLoad';
import { Form } from './scripts/components/Form';
import { ScrollToTop } from './scripts/components/scrollToTop';

/**
 * Инициализация приложения
 */
class App {
    private videoModal: VideoModal;

    constructor() {
        this.videoModal = new VideoModal();
        new Menu();
        new ScrollAnimations();
        new LazyLoad();
        new Form();
        new ScrollToTop();
        this.init();
    }

    /**
     * Инициализация обработчиков событий
     */
    private init(): void {
        this.setupVideoLinks();
    }

    /**
     * Настройка обработчиков для видео ссылок
     */
    private setupVideoLinks(): void {
        const videoLinks = document.querySelectorAll('[data-video-url]');

        videoLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const videoUrl = (link as HTMLElement).dataset.videoUrl;
                const videoTitle = (link as HTMLElement).dataset.videoTitle || 'Видео';

                if (videoUrl) {
                    this.videoModal.open(videoUrl, videoTitle);
                }
            });
        });
    }
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
