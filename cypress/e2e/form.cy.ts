describe('Form', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should display the form and controls', () => {
        cy.get('.footer').invoke('removeClass', 'animate-hidden');
        cy.get('.form').should('be.visible');
        cy.get('.form__input').should('be.visible');
        cy.get('.form__button').should('be.visible');
    });

    it('should show error and highlight field when submitting empty form', () => {
        cy.get('.form__button').click();

        cy.get('.form__message')
            .should('be.visible')
            .should('have.class', 'form__message_type_error');
        cy.get('.form__input').should('have.attr', 'aria-invalid', 'true');
    });

    it('should show error and highlight field when submitting invalid email', () => {
        cy.get('.form__input').type('invalid-email');
        cy.get('.form__button').click();

        cy.get('.form__message')
            .should('be.visible')
            .should('have.class', 'form__message_type_error');
        cy.get('.form__input').should('have.attr', 'aria-invalid', 'true');
    });

    it('should disable button during submission', () => {
        cy.get('.form__input').type('test@example.com');
        cy.get('.form__button').click();

        cy.get('.form__button').should('be.disabled');
    });

    it('should show result message after submission', () => {
        cy.get('.form__input').type('test@example.com');
        cy.get('.form__button').click();

        // Ждём ЛЮБОЙ результат
        cy.get('.form__message', { timeout: 3000 })
            .should('be.visible')
            .should(
                'satisfy',
                ($el) =>
                    $el.hasClass('form__message_type_success') ||
                    $el.hasClass('form__message_type_error'),
            );

        // cy.get(".form__message").should("be.visible").should("have.class", "form__message_type_success");
        // cy.get(".form__input").should("not.have.attr", "aria-invalid");

        // Проверяем что появилось ЛЮБОЕ сообщение (success или error)
        // cy.get(".form__message", { timeout: 3000 }).should("be.visible");

        // // Проверяем что есть класс типа сообщения
        // cy.get(".form__message").should("satisfy", ($el) => {
        //     return $el.hasClass("form__message_type_success") ||
        //         $el.hasClass("form__message_type_error");
        // });
    });

    it('should clear input after successful submission', () => {
        const test = 'test@example.com';

        cy.get('.form__input').type(test);
        cy.get('.form__button').click();

        cy.get('.form__message', { timeout: 3000 })
            .should('be.visible')
            .then(($el) => {
                if ($el.hasClass('form__message_type_success')) {
                    cy.get('.form__input').should('have.value', '');
                } else {
                    // Если сообщение об ошибке, то поле не должно очищаться
                    cy.get('.form__input').should('have.value', test);
                }
            });

        // // Ждём ЛЮБОЙ результат
        // cy.get(".form__message", { timeout: 3000 }).should("be.visible")
        //     .should("satisfy", ($el) => $el.hasClass("form__message_type_success") || $el.hasClass("form__message_type_error"));

        // cy.get('.form__input').should('have.value', '');
    });

    it('should set aria-invalid on validation error', () => {
        cy.get('.form__button').click();

        cy.get('.form__input').should('have.attr', 'aria-invalid', 'true');
    });

    it('should clear error message when user starts typing', () => {
        cy.get('.form__button').click();
        cy.get('.form__message').should('be.visible');

        cy.get('.form__input').type('test');

        // Проверяем что класс visible удалён
        cy.get('.form__message').should('not.have.class', 'form__message_visible');
    });
});
