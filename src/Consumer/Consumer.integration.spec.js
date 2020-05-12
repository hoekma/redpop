const { expect } = require('chai');
const testConfig = require('./test/testConfig');
const Consumer = require('.');

describe('Consumer Integration Tests', () => {
  it('starts a consumer', async () => {
    const consumer = new Consumer(testConfig);
    const status = await consumer.start();

    expect(status).equals('stopped');
  });
});
