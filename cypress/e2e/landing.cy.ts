describe('Landing page', () => {
    const placesLinks = [
        {
            text: 'Нацпарк «Куршская коса»',
            href: 'http://park-kosa.ru',
        },
        {
            text: 'National Geographic Your Shot',
            href: 'https://yourshot.nationalgeographic.com/photos/?keywords=kolskiy',
        },
        {
            text: 'VISIT ALTAI',
            href: 'https://www.visitaltai.info/',
        },
        {
            text: 'Байкальская миля',
            href: 'http://baikal.milerace.ru/',
        },
        {
            text: 'Водлозерский национальный парк',
            href: 'http://vodlozero.ru',
        },
    ];

    const footerLinks = [
        {
            text: 'Карты',
            href: 'https://yandex.ru/maps',
        },
        {
            text: 'Погода',
            href: 'https://yandex.ru/pogoda',
        },
        {
            text: 'Расписание',
            href: 'https://rasp.yandex.ru',
        },
        {
            text: 'Календарь',
            href: 'https://calendar.yandex.ru',
        },
        {
            text: 'Путешествия',
            href: 'https://travel.yandex.ru',
        },
    ];

    beforeEach(() => {
        cy.visit('/');
    });

    it('should load the landing page', () => {
        cy.get('h1').should('be.visible');
    });

    it('should have a navigation menu', () => {
        cy.get('nav').should('exist');
    });

    it('should contain correct place links and labels', () => {
        cy.get('.places__url').should('have.length', 5);

        cy.get('.places__url').each(($link, index) => {
            cy.wrap($link)
                .and('have.attr', 'href', placesLinks[index].href)
                .and('have.attr', 'target', '_blank')
                .and('have.attr', 'rel', 'noopener noreferrer');

            cy.wrap($link)
                .invoke('text')
                .then((text) => {
                    expect(text.trim()).to.eq(placesLinks[index].text);
                });
        });
    });

    it('should contain correct cover link attributes', () => {
        cy.get('.panel__cover')
            .should('have.attr', 'href', 'https://stampsy.com/na-elektrichkakh-do-baikala')
            .and('have.attr', 'target', '_blank')
            .and('have.attr', 'rel', 'noopener noreferrer');
    });

    it('should contain correct footer links and labels', () => {
        cy.get('footer .menu__item').should('have.length', 5);

        cy.get('footer .menu__item').each(($link, index) => {
            cy.wrap($link)
                .and('have.attr', 'href', footerLinks[index].href)
                .and('have.attr', 'target', '_blank')
                .and('have.attr', 'rel', 'noopener noreferrer');

            cy.wrap($link)
                .invoke('text')
                .then((text) => {
                    expect(text.trim()).to.eq(footerLinks[index].text);
                });
        });
    });
});
