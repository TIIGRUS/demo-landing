describe('Navigation', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should have 6 navigation links', () => {
        cy.get('.header__menu-list .header__menu-link').should('have.length', 6);
    });

    it('should open the navigation menu on burger click', () => {
        cy.get('.header__burger').click();
        cy.get('.header__menu').should('have.class', 'header__menu_opened').should('be.visible');
    });

    it('should close the navigation menu on burger click', () => {
        cy.get('.header__burger').click();
        cy.get('.header__menu').should('have.class', 'header__menu_opened').should('be.visible');
        cy.get('.header__menu-close').click();
        cy.get('.header__menu')
            .should('not.have.class', 'header__menu_opened')
            .should('not.be.visible');
    });

    it('should have correct href attributes for navigation links', () => {
        const links = ['#lead', '#about', '#gallery', '#places', '#video', '#photographers'];

        cy.get('.header__menu-list .header__menu-link').each(($link, index) => {
            cy.wrap($link).should('have.attr', 'href', links[index]);
        });
    });
});
