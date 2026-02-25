import { messages } from './validators';

/**
 * Симуляция API запроса для отправки email
 * @param email - Email адрес для отправки
 * @returns Promise который резолвится при успехе или отклоняется при ошибке
 */
export function submitToAPI(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Симуляция: 80% успех, 20% ошибка
            const isSuccess = Math.random() > 0.2;

            if (isSuccess) {
                console.log(messages.submitSuccessLog, email);
                resolve();
            } else {
                reject(new Error(messages.submitError));
            }
        }, 1500);
    });
}
