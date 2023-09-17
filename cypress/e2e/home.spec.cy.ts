describe('Home - Initial Page', () => {
  const nameInput = 'stefano2007';

  it('Should perform search if form is valid', () => {
    cy.visit('/');
    cy.contains('Github Profile Explorer');
    cy.get('[name="input-search"]').type(nameInput);
    cy.get('[name="submit-search"]').click();
    cy.url().should('include', nameInput);
  });

  it('Should not perform search if form empty', () => {
    cy.visit('/');
    cy.contains('Github Profile Explorer');
    cy.get('[name="submit-search"]').click();
    cy.url().should('not.include', 'search');
  })
})
