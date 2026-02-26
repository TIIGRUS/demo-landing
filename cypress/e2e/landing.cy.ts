describe("Landing page", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("should load the landing page", () => {
        cy.get("h1").should("be.visible");
    });

    it('should have a navigation menu', () => {
        cy.get('nav').should('exist');
    });

});
