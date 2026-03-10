import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { submitToAPI } from '../src/scripts/utils/api';
import { messages } from '../src/scripts/utils/validators';

const TEST_EMAIL = 'test@example.ru';

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
