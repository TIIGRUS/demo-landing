import type { Place, PlaceEntry } from '../types/place';

const PLACES: PlaceEntry[] = [
    {
        ru: 'Красная площадь',
        en: 'Red Square',
    },
    {
        ru: 'Эрмитаж',
        en: 'Hermitage_Museum',
    },
    {
        ru: 'Петергоф',
        en: 'Petergof',
    },
    {
        ru: 'Кремль',
        en: 'Kremlin',
    },
    {
        ru: 'Третьяковская галерея',
        en: 'Tretyakov_Gallery',
    },
    {
        ru: 'Казанский кремль',
        en: 'Kazan_Kremlin',
    },
    {
        ru: 'Мамаев курган',
        en: 'Mamayev_Kurgan',
    },
    {
        ru: 'Большой театр',
        en: 'Bolshoi_Theatre',
    },
    {
        ru: 'Золотое кольцо России',
        en: 'Golden_Ring_of_Russia',
    },
    {
        ru: 'Кижи',
        en: 'Kizhi_Pogost',
    },
];

let currentPlaceIndex = 0;

export async function fetchPlace(lang: keyof PlaceEntry = 'ru'): Promise<Place | null> {
    if (currentPlaceIndex >= PLACES.length) return null;

    const placeEntry = PLACES[currentPlaceIndex];
    const title = lang === 'ru' ? placeEntry.ru : placeEntry.en;
    const domain = lang === 'ru' ? 'ru' : 'en';

    const url = `https://${domain}.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=true&explaintext=true&format=json&titles=${title}&origin=*&piprop=original`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Ошибка при загрузке данных: ${response.statusText}`);
        }

        const data = await response.json();
        const page = Object.values(data.query.pages)[0] as any;

        if (!page || page.missing) {
            console.warn(`Страница не найдена: ${title}`);
            currentPlaceIndex++;
            return fetchPlace(lang); // Попробовать загрузить следующее место
        }

        currentPlaceIndex++;

        return {
            title: page.title,
            description: page.extract ?? 'Описание недоступно',
            img: page.original?.source ?? 'https://placehold.co/600x400?text=No+Image',
            url: `https://${domain}.wikipedia.org/?curid=${page.pageid}`,
        };
    } catch (error) {
        console.error(`Ошибка при загрузке данных: ${error}`);
        throw error instanceof Error ? error : new Error('Ошибка при загрузке данных');
    }
}
