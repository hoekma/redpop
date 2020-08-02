const { expect } = require('chai');
const sandbox = require('sinon').createSandbox();
const Publisher = require('.');
describe('Pulisher Unit Tests', () => {
  let xaddStub;
  let message;

  before(() => {
    message = {
      message: 'message'
    };
    xaddStub = sandbox
      .stub(Publisher.prototype, 'xadd')
      .resolves('1234567890123-0');
  });

  it('instantiates a publisher', () => {
    const publisher = new Publisher();
    expect(publisher.config).to.be.an('Object');
    expect(publisher.config.server.address).to.equal('localhost');
  });
  it('publishes a message with the default stream', async () => {
    const publisher = new Publisher();
    const messageId = await publisher.publish(message);
    expect(messageId.length).equals(15);
    sandbox.assert.calledWith(xaddStub, message, publisher.config.stream.name);
  });
  it('publishes a message to a spefific stream', async () => {
    const publisher = new Publisher();
    const messageId = await publisher.publish(message, 'testStream');
    expect(messageId.length).equals(15);
    sandbox.assert.calledWith(xaddStub, message, 'testStream');
  });
});
