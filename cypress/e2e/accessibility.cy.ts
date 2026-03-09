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
        cy.get('.skip-link').should('exist').and('have.attr', 'href', '#main-content');
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

    it('should be buttons, not links', () => {
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

describe('Language switcher accessibility', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should have aria-current on the active language', () => {
        cy.get('.menu__item_active').should('have.attr', 'aria-current', 'true');
    });

    it('should not have aria-current on the inactive language', () => {
        cy.get('.menu__item')
            .not('.menu__item_active')
            .should('have.attr', 'aria-current', 'false');
    });
});

describe('Link accessibility', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should show outline on keyboard focus', () => {
        cy.get('.places__url')
            .first()
            .scrollIntoView()
            .should('be.visible')
            .focus()
            .should('have.css', 'outline-style', 'solid');
    });

    it('should show outline on keyboard focus for menu items', () => {
        cy.get('.menu__item').first().scrollIntoView().should('be.visible').focus();
        cy.get('.menu__item').first().should('have.css', 'outline-style', 'solid');
    });
});

describe('Input accessibility', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should show error state when aria-invalid is true', () => {
        cy.get('.form__input#email').scrollIntoView().type('invalid email');
        cy.get('.form__button').click();
        cy.get('.form__input#email').should('have.attr', 'aria-invalid', 'true');
        cy.get('.form__input#email').should('have.css', 'border-width', '1px');
    });

    it('should show focus state when focused', () => {
        cy.get('.form__input').first().focus();
        cy.get('.form__input').first().should('have.css', 'box-shadow').and('not.equal', 'none');
    });
});
