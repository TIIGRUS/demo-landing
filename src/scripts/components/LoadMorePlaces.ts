import type { Place } from '../../types/place';
import { fetchPlace } from '../../api/places';
export class LoadMorePlaces {
    private button: HTMLButtonElement | null;
    private placesContainer: HTMLElement | null;
    private template: HTMLTemplateElement | null;
    private isLoading = false;
    private loadingElement: HTMLLIElement | null = null;
    private originalButtonText: string | null = null;
    private static readonly SELECTORS = {
        button: '.places__button',
        list: '.places__list',
        template: '#place-template',
        title: '.place__title',
        paragraph: '.place__paragraph',
        image: '.place__image',
        url: '.place__url',
    } as const;
    // private hasMore = true;

    // constructor(buttonSelector: string, placesContainerSelector: string) {
    constructor() {
        this.button = document.querySelector(LoadMorePlaces.SELECTORS.button);
        this.placesContainer = document.querySelector(LoadMorePlaces.SELECTORS.list);
        this.template = document.querySelector(LoadMorePlaces.SELECTORS.template);
        this.init();
    }

    private setLoading(loading: boolean) {
        if (this.isLoading === loading) return;
        this.isLoading = loading;

        if (this.button) {
            this.button.disabled = loading;
            if (loading) {
                this.originalButtonText = this.button.textContent;
                this.button.textContent = 'Загрузка...';
            } else if (this.originalButtonText !== null) {
                this.button.textContent = this.originalButtonText;
            }
        }

        if (!this.placesContainer) return;

        if (loading) {
            this.placesContainer.setAttribute('aria-busy', 'true');
            if (!this.loadingElement) {
                const li = document.createElement('li');
                li.className = 'places__spinner';
                li.setAttribute('role', 'status');
                li.setAttribute('aria-live', 'polite');

                const spinner = document.createElement('div');
                spinner.className = 'spinner';
                spinner.setAttribute('aria-hidden', 'true');

                const sr = document.createElement('span');
                sr.className = 'visually-hidden';
                sr.textContent = 'Загрузка...';

                li.appendChild(spinner);
                li.appendChild(sr);
                this.loadingElement = li;
            }
            if (!this.placesContainer.querySelector('.places__spinner')) {
                this.placesContainer.appendChild(this.loadingElement);
            }
        } else {
            this.placesContainer.removeAttribute('aria-busy');
            const spinner = this.placesContainer.querySelector('.places__spinner');
            if (spinner) spinner.remove();
        }
    }

    public init() {
        if (this.button) {
            this.button.addEventListener('click', () => this.loadMorePlaces());
        }
    }

    private async loadMorePlaces() {
        if (!this.template || !this.placesContainer) return;

        if (this.isLoading) return;
        this.setLoading(true);

        try {
            const place = await fetchPlace();

            if (!place) {
                this.setLoading(false);
                // this.hasMore = false;
                if (this.button) {
                    this.button.disabled = true;
                    this.button.textContent = 'Больше нет мест';
                }
                return;
            }

            this.clearError();
            this.placesContainer.appendChild(this.createPlaceElement(place));
            this.setLoading(false);
        } catch (error) {
            this.setLoading(false);
            const message = `Ошибка при получении карточек: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
            this.showError(message);
        }
    }

    private showError(message: string) {
        if (!this.placesContainer) return;
        let el = this.placesContainer.querySelector<HTMLElement>('.places__error');
        if (!el) {
            el = document.createElement('div');
            el.className = 'places__error';
            this.placesContainer.appendChild(el);
        }
        el.textContent = message;
    }

    private clearError() {
        if (!this.placesContainer) return;
        const el = this.placesContainer.querySelector('.places__error');
        if (el) el.remove();
    }

    private createPlaceElement(place: Place): DocumentFragment {
        const placeElement = this.template!.content.cloneNode(true) as DocumentFragment;

        const title = placeElement.querySelector<HTMLHeadingElement>(
            LoadMorePlaces.SELECTORS.title,
        );
        const paragraph = placeElement.querySelector<HTMLParagraphElement>(
            LoadMorePlaces.SELECTORS.paragraph,
        );
        const img = placeElement.querySelector<HTMLImageElement>(LoadMorePlaces.SELECTORS.image);
        const link = placeElement.querySelector<HTMLAnchorElement>(LoadMorePlaces.SELECTORS.url);

        if (title) title.textContent = place.title;
        if (img) img.src = place.img;
        if (link) {
            link.href = place.url;
            link.textContent = place.url;
        }
        if (paragraph) {
            const groups = this.groupParagraphs(place.description);
            const fragment = document.createDocumentFragment();
            groups.forEach((g) => {
                const p = document.createElement('p');
                p.className = 'place__paragraph';
                p.textContent = g;
                fragment.appendChild(p);
            });
            paragraph.replaceWith(fragment);
        }

        return placeElement;
    }

    private groupParagraphs(text: string): string[] {
        const paragraphs = text
            .split(/\r?\n/)
            .map((p) => p.trim())
            .filter(Boolean)
            .slice(0, 2);
        const result: string[] = [];

        for (let i = 0; i < paragraphs.length; i += 2) {
            result.push(paragraphs.slice(i, i + 2).join('\n\n'));
        }

        return result;
    }
}
