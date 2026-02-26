describe('Modal Video', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should open the modal when the video thumbnail is clicked', () => {
        // Находим кнопку открытия видео
        cy.get('[data-video-url]').first().click();

        // Проверяем, что dialog открыт
        cy.get('.video-modal').should('be.visible');
    });

    it('should close the modal when the close button is clicked', () => {
        // Открываем модальное окно
        cy.get('[data-video-url]').first().click();
        cy.get('.video-modal').should('be.visible');

        // Нажимаем на кнопку закрытия
        cy.get('.video-modal .video-modal__close').click();
        cy.get('.video-modal').should('not.be.visible');
    });

    it('should close the modal when pressing the Escape key', () => {
        cy.get('[data-video-url]').first().click();
        cy.get('.video-modal').should('have.attr', 'open');

        cy.get('.video-modal').trigger('cancel');

        cy.get('.video-modal').should('not.have.attr', 'open');
    });

    it('should close the modal when clicking outside the video content', () => {
        // Открываем модальное окно
        cy.get('[data-video-url]').first().click();
        cy.get('.video-modal').should('be.visible');

        // Нажимаем на область вне видео
        cy.get('.video-modal').click('topLeft');
        cy.get('.video-modal').should('not.be.visible');
    });

    it('should add modal-open class to body when modal opens', () => {
        cy.get('[data-video-url]').first().click();
        cy.get('body').should('have.class', 'modal-open');
    });

    it('should remove modal-open class from body when modal closes', () => {
        cy.get('[data-video-url]').first().click();
        cy.get('body').should('have.class', 'modal-open');

        cy.get('.video-modal .video-modal__close').click();
        cy.get('body').should('not.have.class', 'modal-open');
    });

    it('should stop video playback when modal closes', () => {
        // Открываем модальное окно
        cy.get('[data-video-url]').first().click();
        cy.get('.video-modal').should('be.visible');

        // Проверяем, что iframe с видео присутствует
        cy.get('.video-modal iframe').should('exist');
        // Закрываем модальное окно
        cy.get('.video-modal .video-modal__close').click();
        // Проверяем, что iframe удалён
        cy.get('.video-modal iframe').should('not.exist');
    });
});
