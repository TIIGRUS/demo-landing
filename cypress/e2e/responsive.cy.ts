describe('Responsive Design', () => {
    beforeEach(() => {
        cy.visit('/'); // Visit the homepage before each test
    });

    const viewports = [
        { width: 1920, height: 1080, label: 'large desktop' },
        { width: 1280, height: 800, label: 'desktop' },
        { width: 768, height: 1024, label: 'tablet' },
        { width: 375, height: 667, label: 'mobile' },
    ];

    viewports.forEach(({ width, height, label }) => {
        it(`should display the header on ${label}`, () => {
            cy.viewport(width, height);

            cy.get('.header').should('be.visible');
        });

        it('should have no horizontal scroll on any viewport', () => {
            viewports.forEach(({ width, height }) => {
                cy.viewport(width, height);
                cy.get('body').should('not.have.css', 'overflow-x', 'hidden'); // Ensure no horizontal scroll
                cy.get('html').should('not.have.css', 'overflow-x', 'hidden'); // Ensure no horizontal scroll
            });
        });

        it(`should open menu when burger menu is clicked on ${label}`, () => {
            cy.viewport(width, height); // Simulate mobile viewport
            cy.get('.header__burger').click(); // Click burger menu
            cy.get('.header__menu')
                .should('have.class', 'header__menu_opened')
                .should('be.visible'); // Ensure menu is opened
        });

        it(`should hide menu when burger menu is clicked again on ${label}`, () => {
            cy.viewport(width, height); // Simulate mobile viewport
            cy.get('.header__burger').click(); // Open menu
            cy.get('.header__menu-close').click(); // Close menu
            cy.get('.header__menu').should('not.have.class', 'header__menu_opened'); // Ensure menu is closed
        });

        it(`should be visible button scroll to top on ${label}`, () => {
            cy.viewport(width, height); // Simulate mobile viewport
            cy.scrollTo('bottom'); // Scroll to bottom of the page
            cy.get('.scroll-to-top').should('be.visible'); // Ensure scroll to top button is visible
        });

        it(`should scroll to top when scroll to top button is clicked on ${label}`, () => {
            cy.viewport(width, height); // Simulate mobile viewport
            cy.scrollTo('bottom'); // Scroll to bottom of the page
            cy.get('.scroll-to-top').click(); // Click scroll to top button
            cy.window().its('scrollY').should('equal', 0); // Ensure page is scrolled to top
        });
    });
});
