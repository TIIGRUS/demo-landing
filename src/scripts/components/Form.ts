import { validators, messages } from "../utils/validators";
import { submitToAPI } from "../utils/api";

/**
 * Form - Компонент формы подписки на email-рассылку
 * Управляет валидацией, состояниями формы и отправкой данных
 */
export class Form {
    private form: HTMLFormElement | null;
    private emailInput: HTMLInputElement | null;
    private submitButton: HTMLButtonElement | null;
    private message: HTMLElement | null;
    private currentState: 'normal' | 'loading' | 'success' | 'error' = 'normal';
    private successTimeout: number | null = null;

    constructor() {
        this.form = document.querySelector('.form');
        this.emailInput = document.querySelector('.form__input');
        this.submitButton = document.querySelector('.form__button');
        this.message = document.querySelector('.form__message');

        if (!this.hasRequiredElements()) {
            console.warn('Form: required form elements not found');
            return;
        }

        this.setupEventListeners();
    }

    /**
     * Проверяет наличие обязательных элементов формы
     */
    private hasRequiredElements(): boolean {
        return !!(this.form && this.emailInput && this.submitButton);
    }

    /**
     * Настройка обработчиков событий
     */
    private setupEventListeners(): void {
        if (!this.form || !this.emailInput) return;

        // Отправка формы
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Валидация при потере фокуса
        this.emailInput.addEventListener('blur', () => {
            if (this.emailInput && validators.email(this.emailInput.value)) {
                this.validateEmail();
            }
        });

        // Очистка ошибок при вводе
        this.emailInput.addEventListener('input', () => {
            if (this.currentState === 'error') {
                this.clearMessage();
            }
        });
    }

    /**
     * Обработка отправки формы
     */
    private async handleSubmit(): Promise<void> {
        if (this.currentState === 'loading') return;

        // Валидация перед отправкой
        if (!this.validateForm()) {
            return;
        }

        this.setLoadingState();

        try {
            // Симуляция API запроса
            await submitToAPI(this.emailInput!.value);
            this.setSuccessState();
        } catch (error) {
            this.setErrorState(error instanceof Error ? error.message : 'Произошла ошибка');
        }
    }

    /**
     * Валидация формы перед отправкой
     */
    private validateForm(): boolean {
        if (!this.emailInput) return false;

        const email = this.emailInput.value.trim();

        if (email === '') {
            // this.showMessage(messages.emailRequired, 'error');
            this.setErrorState(messages.emailRequired);
            this.emailInput.focus();
            return false;
        }

        if (!validators.email(email)) {
            // this.showMessage(messages.emailInvalid, 'error');
            this.setErrorState(messages.emailInvalid);
            this.emailInput.focus();
            return false;
        }

        return true;
    }

    /**
     * Валидация email при потере фокуса
     */
    private validateEmail(): boolean {
        if (!this.emailInput) return false;

        const email = this.emailInput.value.trim();

        if (!validators.email(email)) {
            // this.showMessage(messages.emailInvalid, 'error');
            this.setErrorState(messages.emailInvalid);
            return false;
        }

        this.clearMessage();
        return true;
    }

    /**
     * Устанавливает UI состояние элементов формы
     * @param disabled - Заблокировать ли элементы
     * @param buttonText - Текст кнопки
     * @param isLoading - Состояние загрузки
     */
    private setUIState(disabled: boolean, buttonText: string, isLoading: boolean = false): void {
        if (!this.submitButton || !this.emailInput) return;

        this.submitButton.disabled = disabled;
        this.emailInput.disabled = disabled;
        this.submitButton.textContent = buttonText;

        if (isLoading) {
            this.submitButton.setAttribute('aria-busy', 'true');
        } else {
            this.submitButton.removeAttribute('aria-busy');
        }
    }

    /**
     * Удаляет все CSS классы состояний формы
     */
    private removeAllStateClasses(): void {
        if (!this.form) return;
        this.form.classList.remove('form_state_loading', 'form_state_success', 'form_state_error');
    }

    /**
     * Устанавливает состояние загрузки
     */
    private setLoadingState(): void {
        if (!this.hasRequiredElements()) return;

        this.currentState = 'loading';
        this.removeAllStateClasses();
        this.form!.classList.add('form_state_loading');
        this.setUIState(true, 'Отправка...', true);
        this.clearMessage();
    }

    /**
     * Устанавливает состояние успеха
     */
    private setSuccessState(): void {
        if (!this.hasRequiredElements()) return;

        this.currentState = 'success';
        this.removeAllStateClasses();
        this.form!.classList.add('form_state_success');
        this.setUIState(false, 'Подписаться');

        this.showMessage(messages.submitSuccess, 'success');

        if (this.emailInput) {
            this.emailInput.value = '';
        }

        if (this.successTimeout) {
            clearTimeout(this.successTimeout);
        }

        this.successTimeout = window.setTimeout(() => {
            this.resetState();
        }, 5000);

        this.focusMessage();
    }

    /**
     * Устанавливает состояние ошибки
     * @param message - Сообщение об ошибке
     */
    private setErrorState(message: string): void {
        if (!this.hasRequiredElements()) return;

        this.currentState = 'error';
        this.removeAllStateClasses();
        this.form!.classList.add('form_state_error');
        this.setUIState(false, 'Подписаться');

        this.showMessage(message, 'error');
        this.focusMessage();
    }

    /**
     * Сбрасывает состояние к нормальному
     */
    private resetState(): void {
        if (!this.hasRequiredElements()) return;

        this.currentState = 'normal';
        this.removeAllStateClasses();
        this.setUIState(false, 'Подписаться');
        this.clearMessage();

        if (this.successTimeout) {
            clearTimeout(this.successTimeout);
            this.successTimeout = null;
        }
    }

    /**
     * Устанавливает фокус на сообщение для скринридеров
     */
    private focusMessage(): void {
        if (!this.message) return;

        this.message.setAttribute('tabindex', '-1');
        this.message.focus();
    }

    /**
     * Показывает сообщение с указанным типом
     * @param text - Текст сообщения
     * @param type - Тип сообщения: 'error' или 'success'
     */
    private showMessage(text: string, type: 'error' | 'success'): void {
        if (!this.message) return;

        // Очищаем предыдущие классы типов
        this.message.classList.remove('form__message_type_error', 'form__message_type_success');

        // Добавляем новый класс типа
        this.message.classList.add(`form__message_type_${type}`);

        // Устанавливаем текст
        this.message.textContent = text;

        // Показываем сообщение
        this.message.classList.add('form__message_visible');
        this.message.setAttribute('aria-hidden', 'false');

        // Устанавливаем правильные ARIA атрибуты
        if (type === 'error') {
            this.message.setAttribute('aria-live', 'assertive');
            this.message.setAttribute('role', 'alert');

            // Связываем с input для ошибок
            if (this.emailInput) {
                this.emailInput.setAttribute('aria-invalid', 'true');
                this.emailInput.setAttribute('aria-describedby', 'form-message');
            }
        } else {
            this.message.setAttribute('aria-live', 'polite');
            this.message.setAttribute('role', 'status');

            // Убираем связь с input для успеха
            if (this.emailInput) {
                this.emailInput.removeAttribute('aria-invalid');
                this.emailInput.removeAttribute('aria-describedby');
            }
        }
    }

    /**
     * Очищает сообщение
     */
    private clearMessage(): void {
        if (!this.message) return;

        this.message.textContent = '';
        this.message.classList.remove('form__message_visible', 'form__message_type_error', 'form__message_type_success');
        this.message.setAttribute('aria-hidden', 'true');
        this.message.setAttribute('aria-live', 'off');
        this.message.removeAttribute('role');

        if (this.emailInput) {
            this.emailInput.removeAttribute('aria-invalid');
            this.emailInput.removeAttribute('aria-describedby');
        }

        if (this.form) {
            this.form.classList.remove('form_state_error', 'form_state_success');
        }
    }

    /**
     * Публичный метод для отправки формы
     * (может быть использован извне)
     */
    public submit(): void {
        this.handleSubmit();
    }

    /**
     * Публичный метод для сброса формы
     */
    public reset(): void {
        if (this.form) {
            this.form.reset();
        }
        this.resetState();
    }

    /**
     * Удаляет все обработчики событий
     */
    public destroy(): void {
        this.resetState();

        if (this.successTimeout) {
            clearTimeout(this.successTimeout);
        }
    }
}
