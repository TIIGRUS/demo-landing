export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validators = {
    email: (value: string) => EMAIL_REGEX.test(value),
    required: (value: string) => value.trim() !== '',
}

export const messages = {
    emailRequired: 'Email обязателен для заполнения',
    emailInvalid: 'Пожалуйста, введите корректный email адрес',
    submitError: 'Не удалось отправить данные. Попробуйте позже',
    submitSuccess: 'Спасибо за подписку! Мы отправили вам письмо',
    submitSuccessLog: 'Form submitted successfully with email:'
}
