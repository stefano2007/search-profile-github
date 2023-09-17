describe('Search - Initial Page', () => {
  const nameInput = 'stefano2007';
  const otherNameInput = 'stefano ferreira';
/*
  it('Should perform search if form is valid', () => {
    cy.visit(`/search?q=${nameInput}`);
    cy.contains('Github Profile Explorer');
    cy.get('[name="input-search"]').should('have.value', nameInput);
  });
*/
  it('Should perform update the field with the "q" parameter of the url', () => {
    cy.visit(`/search?q=${nameInput}`);
    cy.contains('Github Profile Explorer');
    cy.get('[name="input-search"]').should('have.value', nameInput);
  });

  it('Should update the URL if call  a new search', () => {
    cy.visit(`/search?q=${nameInput}`);
    cy.contains('Github Profile Explorer');
    cy.get('[name="input-search"]').clear().type(otherNameInput);
    cy.get('[name="submit-search"]').click();
    cy.url().should('not.include', nameInput);
  });

  /*


  it('Should not perform search if form empty', () => {
    cy.visit('/');
    cy.contains('Github Profile Explorer');
    cy.get('[name="submit-search"]').click();
    cy.url().should('not.include', 'search');
  })*/
})
