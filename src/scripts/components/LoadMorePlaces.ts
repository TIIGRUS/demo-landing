import type { Place } from '../../types/place';
import { fetchPlace } from '../../api/places';
export class LoadMorePlaces {
    private button: HTMLButtonElement | null;
    private placesContainer: HTMLElement | null;
    private template: HTMLTemplateElement | null;
    private isLoading = false;
    private loadingElement: HTMLLIElement | null = null;
    private originalButtonText: string | null = null;
    private hasMore = true;

    private static readonly SELECTORS = {
        button: '.places__button',
        list: '.places__list',
        template: '#place-template',
        title: '.place__title',
        paragraph: '.place__paragraph',
        image: '.place__image',
        url: '.place__url',
    } as const;

    private static readonly MESSAGES = {
        LOADING: 'Загрузка...',
        NO_MORE_PLACES: 'Больше нет мест',
        FETCH_ERROR: 'Ошибка при получении карточек: Пожалуйста, попробуйте позже.',
        WIKI_LINK_TEXT: (title: string) => `${title} - на Википедии`,
        WIKI_LINK_ARIA_LABEL: (title: string) =>
            `Статья про ${title} на Википедии (откроется в новой вкладке)`,
    } as const;

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
                this.button.textContent = LoadMorePlaces.MESSAGES.LOADING;
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
                this.hasMore = false;
                this.setLoading(false);
                this.setButtonState(this.hasMore);
                return;
            }

            this.clearError();

            // 1. Создаем фрагмент
            const fragment = this.createPlaceElement(place);

            // 2. Находим заголовок ВНУТРИ фрагмента до вставки
            const titleToFocus = fragment.querySelector<HTMLHeadingElement>(
                LoadMorePlaces.SELECTORS.title,
            );

            // 3. Вставляем в DOM
            this.placesContainer.appendChild(fragment);

            // 4. Сначала возвращаем кнопку в активное состояние
            this.setLoading(false);
            this.setButtonState(this.hasMore);

            // 5. Теперь переводим фокус. setTimeout нужен, чтобы кнопка успела
            // перестать быть disabled и браузер не сбросил фокус на body.
            if (titleToFocus) {
                setTimeout(() => {
                    titleToFocus.focus();
                }, 100);
            }
        } catch (error) {
            this.setLoading(false);
            const message = LoadMorePlaces.MESSAGES.FETCH_ERROR;
            this.showError(message);
        }
    }

    private showError(message: string) {
        if (!this.placesContainer) return;
        let el = this.placesContainer.querySelector<HTMLElement>('.places__error');
        if (!el) {
            el = document.createElement('div');
            el.className = 'places__error';
            el.setAttribute('role', 'alert');
            el.setAttribute('aria-live', 'assertive');
            this.placesContainer.appendChild(el);
            this.setButtonState(false);

            setTimeout(() => {
                this.clearError();
                this.setButtonState(this.hasMore);
            }, 5000);
        }
        el.textContent = message;
    }

    private clearError() {
        if (!this.placesContainer) return;
        const el = this.placesContainer.querySelector('.places__error');
        if (el) el.remove();
    }

    private setButtonState(hasMore: boolean) {
        if (!this.button) return;
        this.button.disabled = !hasMore;
        if (!hasMore) {
            this.button.textContent = LoadMorePlaces.MESSAGES.NO_MORE_PLACES;
        } else if (this.originalButtonText) {
            this.button.textContent = this.originalButtonText;
        }
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

        if (title) {
            title.textContent = place.title;
            title.setAttribute('tabindex', '-1');
        }
        if (img) {
            img.src = place.img;
            img.alt = place.title;
        }
        if (link) {
            link.href = place.url;
            link.textContent = LoadMorePlaces.MESSAGES.WIKI_LINK_TEXT(place.title);
            link.setAttribute(
                'aria-label',
                LoadMorePlaces.MESSAGES.WIKI_LINK_ARIA_LABEL(place.title),
            );
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
