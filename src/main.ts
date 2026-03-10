import { VideoModal } from './scripts/components/VideoModal';
import { Menu } from './scripts/components/Menu';
import { ScrollAnimations } from './scripts/components/ScrollAnimations';
import { LazyLoad } from './scripts/components/LazyLoad';
import { Form } from './scripts/components/Form';
import { ScrollToTop } from './scripts/components/scrollToTop';
import { analytics } from './scripts/components/Analytics';

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
        this.setupPlaceLinks();
    }

    /**
     * Настройка обработчиков для видео ссылок
     */
    private setupVideoLinks(): void {
        const videoItems = document.querySelectorAll('[data-video-url]');

        videoItems.forEach((videoItem) => {
            videoItem.addEventListener('click', (e) => {
                e.preventDefault();

                const videoUrl = (videoItem as HTMLElement).dataset.videoUrl;
                const videoTitle = (videoItem as HTMLElement).dataset.videoTitle || 'Видео';

                if (videoUrl) {
                    this.videoModal.open(videoUrl, videoTitle);
                }
            });
        });
    }

    /**
     * Настройка обработчиков для ссылок на места
     */
    private setupPlaceLinks(): void {
        const placeLinks = document.querySelectorAll('.places__url');

        placeLinks.forEach((placeLink) => {
            placeLink.addEventListener('click', () => {
                const placeName =
                    placeLink
                        .closest('.places__item')
                        ?.querySelector('.places__title')
                        ?.textContent?.trim() ?? 'Unknown';

                analytics.trackPlaceLink(placeName);
            });
        });
    }
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
