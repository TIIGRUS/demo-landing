import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { messages } from '../src/scripts/utils/validators';
import { Form } from '../src/scripts/components/Form';

describe('Form Component', () => {
    beforeEach(() => {
        document.body.innerHTML = `
         <form class="form" novalidate aria-label="Форма подписки на рассылку">
                <input
                    class="form__input"
                    type="email"
                    name="email"
                    placeholder="Email для подписки"
                    aria-label="Email адрес"
                    required
                />
                <button
                    class="button-base form__button"
                    type="submit"
                    aria-label="Подписаться на рассылку"
                >
                    Подписаться
                </button>
                <div
                    id="form-message"
                    class="form__message"
                    aria-live="off"
                    aria-atomic="true"
                    aria-hidden="true"
                ></div>
            </form>
            `;
    });

    // Тест 1: Проверяем, что при отправке формы без email отображается сообщение об ошибке

    it('should display error message for empty email', () => {
        // 1. Создаем экземпляр компонента Form
        new Form();

        // 2. Находим элементы формы
        const form = document.querySelector('.form') as HTMLFormElement;

        // 3. Имитируем отправку формы (как будто пользователь нажал "Подписаться")
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        // 4. Находим элемент с сообщением об ошибке
        const messageElement = document.querySelector('.form__message') as HTMLDivElement;

        // 5. Проверяем, что отобразилось правильное сообщение
        expect(messageElement.textContent).toBe(messages.emailRequired);
        expect(messageElement.getAttribute('aria-hidden')).toBe('false');
        expect(messageElement.classList.contains('form__message_type_error')).toBe(true);
    });

    // Тест 2: Проверяем, что при отправке формы с валидным email отображается сообщение об успехе

    it('should invalid message for wrong email', () => {
        // 1. Создаем экземпляр компонента Form
        new Form();

        // 2. Находим input и вводим невалидный email
        const emailInput = document.querySelector('.form__input') as HTMLInputElement;
        emailInput.value = 'invalid-email';

        // 3. Отправляем форму
        const form = document.querySelector('.form') as HTMLFormElement;
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        // 4. Проверяем сообщение об ошибке
        const messageElement = document.querySelector('.form__message') as HTMLDivElement;
        expect(messageElement.textContent).toBe(messages.emailInvalid);
        expect(messageElement.getAttribute('role')).toBe('alert');
    });
});
