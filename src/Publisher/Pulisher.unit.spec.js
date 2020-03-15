const { expect } = require('chai');

describe('Pulisher Unit Tests', () => {
  let Publisher;
  before(() => {
    Publisher = require('.');
  });

  after(() => {
    Publisher = null;
  });

  it('instantiates a publisher', () => {
    const publisher = new Publisher();
    expect(publisher.config).to.be.an('Object');
    expect(publisher.config.server.address).to.equal('localhost');
  });
});
