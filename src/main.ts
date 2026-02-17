import { VideoModal } from './scripts/components/VideoModal';
import { Menu } from './scripts/components/Menu';
import { ScrollAnimations } from './scripts/components/ScrollAnimations';
import { LazyLoad } from './scripts/components/LazyLoad';

/**
 * Инициализация приложения
 */
class App {
    private videoModal: VideoModal;
    private menu: Menu;
    private scrollAnimations: ScrollAnimations;
    private lazyLoad: LazyLoad;

    constructor() {
        this.videoModal = new VideoModal();
        this.menu = new Menu();
        this.scrollAnimations = new ScrollAnimations();
        this.lazyLoad = new LazyLoad();
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
