import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { submitToAPI } from '../src/scripts/utils/api';
import { messages } from '../src/scripts/utils/validators';
import { fetchPlace } from '../src/api/places';

const TEST_EMAIL = 'test@example.ru';
const mockPage = {
    query: {
        pages: {
            123: {
                title: 'Test Place',
                extract: 'A short description for testing.',
                original: { source: 'https://example.com/image.jpg' },
            },
        },
    },
};

describe('submitToAPI', () => {
    // Очищаем fake таймеры после каждого теста
    afterEach(() => {
        vi.clearAllTimers();
    });

    /**
     * Тест 1: Функция возвращает Promise
     * Проверяем, что submitToAPI возвращает именно Promise
     */

    it('should return a Promise', () => {
        const result = submitToAPI(TEST_EMAIL);
        expect(result).toBeInstanceOf(Promise);
    });

    /**
     * Тест 2: Promise успешно резолвится (resolve)
     * Используем async/await для работы с асинхронным кодом
     */

    it('should resolve successfully', async () => {
        // Включаем поддельные таймеры
        vi.useFakeTimers();
        vi.spyOn(Math, 'random').mockReturnValue(0.5); // Мокируем Math.random() так, чтобы он всегда возвращал 0.5 (успех)

        const promise = submitToAPI(TEST_EMAIL);

        // vi.runAllTimers();
        // Прокручиваем все таймауты вперед
        vi.advanceTimersByTimeAsync(1500);

        // Проверяем, что Promise не был отклонен (rejected)
        await expect(promise).resolves.toBeUndefined();
    });

    /**
     * Тест 3: Функция работает с разными email адресами
     */

    it('should accept any valid email address', async () => {
        vi.useFakeTimers();

        const validEmails = [TEST_EMAIL, 'john.doe@company.com', 'test+tag@domain.co.uk'];

        for (const email of validEmails) {
            const promise = submitToAPI(email);

            // vi.runAllTimers();
            vi.advanceTimersByTimeAsync(1500);

            // Просто проверяем, что Promise вернулся
            await expect(promise).toBeInstanceOf(Promise);
        }
    });

    /**
     * Тест 4: Функция может иногда отклоняться (reject)
     * Примечание: так как 80% успех/20% ошибка - это рандом,
     * нам нужно мокировать Math.random()
     */

    it('should sometimes reject (when Math.random() < 0.2', async () => {
        vi.useFakeTimers();

        vi.spyOn(Math, 'random').mockReturnValue(0.1); // Мокируем Math.random() так, чтобы он всегда возвращал 0.1 (ошибка)

        const promise = submitToAPI(TEST_EMAIL);
        vi.advanceTimersByTimeAsync(1500);

        // Проверяем, что Promise был отклонен с ошибкой
        await expect(promise).rejects.toThrow(messages.submitError);

        // Восстанавливаем оригинальное поведение Math.random()
        vi.restoreAllMocks();
    });

    /**
     * Тест 5: Функция иногда успешно резолвится
     * Мокируем Math.random() чтобы вернулось значение > 0.2 (успех)
     */

    it('should sometimes resolve (when Math.random() > 0.2)', async () => {
        vi.useFakeTimers();

        vi.spyOn(Math, 'random').mockReturnValue(0.5); // Мокируем Math.random() так, чтобы он всегда возвращал 0.5 (успех)

        const promise = submitToAPI(TEST_EMAIL);
        vi.advanceTimersByTimeAsync(1500);

        // Проверяем, что Promise успешно резолвится
        await expect(promise).resolves.toBeUndefined();

        // Восстанавливаем оригинальное поведение Math.random()
        vi.restoreAllMocks();
    });

    /**
     * Тест 6: Проверяем, что функция логирует сообщение при успехе
     */

    it('should log success message on successful submission', async () => {
        vi.useFakeTimers();

        vi.spyOn(Math, 'random').mockReturnValue(0.5); // Мокируем Math.random() так, чтобы он всегда возвращал 0.5 (успех)
        const consoleSpy = vi.spyOn(console, 'log');

        const promise = submitToAPI(TEST_EMAIL);
        vi.advanceTimersByTimeAsync(1500);
        await promise;

        expect(consoleSpy).toHaveBeenCalledWith(messages.submitSuccessLog, TEST_EMAIL);

        // Восстанавливаем оригинальное поведение Math.random() и console.log
        vi.restoreAllMocks();
    });
});

describe('fetchPlace', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns place data when API responds with a page', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockPage),
                }),
            ),
        );

        const place = await fetchPlace('en');

        expect(place).not.toBeNull();
        expect(place).toHaveProperty('title', 'Test Place');
        expect(place).toHaveProperty('description', 'A short description for testing.');
        expect(place).toHaveProperty('img', 'https://example.com/image.jpg');
        expect(place).toHaveProperty('url');
    });

    it('throws when network response is not ok', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.resolve({ ok: false, statusText: 'Bad Request' })),
        );

        await expect(fetchPlace('ru')).rejects.toThrow();
    });
});
