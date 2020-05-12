const { expect } = require('chai');
const testConfig = require('./test/testConfig');
const Subscriber = require('.');

describe('Subscriber Integration Tests', () => {
  it('starts a subscriber', async () => {
    const subscriber = new Subscriber(testConfig);
    const status = await subscriber.start();

    expect(status).equals('stopped');
  });
});
