const { expect } = require('chai');
const sandbox = require('sinon').createSandbox();
const Publisher = require('.');
const testConfigNoStream = require('./test/testConfigNoStream');

describe('Publisher Unit Tests', () => {
  let xaddStub;
  let event;

  before(() => {
    event = {
      event: 'event'
    };
    xaddStub = sandbox
      .stub(Publisher.prototype, 'xadd')
      .resolves('1234567890123-0');
  });

  it('instantiates a publisher', () => {
    const publisher = new Publisher();
    expect(publisher.config).to.be.an('Object');
    expect(publisher.config.server.connection.host).to.equal('localhost');
  });
  it('instantiates a publisher without a stream defined', async () => {
    const publisher = new Publisher(testConfigNoStream);
    expect(publisher.config).to.be.an('Object');
    expect(publisher.config.server.connection.host).to.equal('localhost');
  });
  it('publishes a event with the default stream', async () => {
    const publisher = new Publisher();
    const eventId = await publisher.publish(event);
    expect(eventId.length).equals(15);
    sandbox.assert.calledWith(xaddStub, event, publisher.config.stream.name);
  });
  it('publishes a event to a spefific stream', async () => {
    const publisher = new Publisher();
    const eventId = await publisher.publish(event, 'testStream');
    expect(eventId.length).equals(15);
    sandbox.assert.calledWith(xaddStub, event, 'testStream');
  });
});
