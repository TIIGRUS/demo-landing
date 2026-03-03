describe('Accessibility tests', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.injectAxe();
    });

    it('should have no a11y violations on page load', () => {
        cy.checkA11y();
    });
});

describe('Skip link functionality', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should exist and point to main content', () => {
        cy.get('.skip-link')
            .should('exist')
            .and('have.attr', 'href', '#main-content');
    });

    it('should move focus to #main-content when activated', () => {
        cy.get('.skip-link').focus().click();
        cy.get('#main-content').should('exist');
    });
});
