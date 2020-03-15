const { expect } = require('chai');

describe('Subscriber Unit Tests', () => {
  let Subscriber;
  before(() => {
    Subscriber = require('.');
  });
  it('instantiates a subscriber', () => {
    const subscriber = new Subscriber();
    expect(subscriber.config).to.be.an('Object');
    expect(subscriber.config.server.address).to.equal('localhost');
  });
});
