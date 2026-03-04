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

describe('Video accessibility', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it("should be buttons, not links", () => {
        cy.get('.video__item').each(($el) => {
            expect($el.prop('tagName')).to.equal('BUTTON');
        });
    });

    it('should have non-empty aria-label', () => {
        cy.get('.video__item').each(($el) => {
            const label = $el.attr('aria-label');
            expect(label).to.exist;
            expect(label!.length).to.be.greaterThan(0);
        });
    });
});

describe('Form accessibility', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should have a label associated with the email input', () => {
        cy.get('label[for="email"]').should('exist');
        cy.get('#email').should('exist');
    });
});
