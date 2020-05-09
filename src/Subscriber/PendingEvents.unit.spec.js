const { expect } = require('chai');
const PendingEvents = require('./PendingEvents');
const Subscriber = require('.');
const testConfig = require('./test/testConfig');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();

const events = [
  ['1584670546084-7', 'consumerGroup_zpUUkOZdI', 1085424347, 1],
  ['1584670546084-8', 'consumerGroup_zpUUkOZdI', 1085424347, 2],
  ['1584670546084-9', 'consumerGroup_zpUUkOZdI', 1085424347, 3],
  ['1584670546084-10', 'consumerGroup_zpUUkOZdI', 1085424347, 1],
  ['1584670546085-0', 'consumerGroup_zpUUkOZdI', 1085424347, 2],
  ['1584670546085-1', 'consumerGroup_zpUUkOZdI', 1085424347, 3],
  ['1584670546085-2', 'consumerGroup_zpUUkOZdI', 1085424347, 4],
  ['1584670546085-3', 'consumerGroup_zpUUkOZdI', 1085424347, 1]
];

describe('PendingEvents Unit Test', () => {
  let xackStub, xpendingStub, xclaimStub;
  beforeEach(() => {
    xackStub = sandbox.stub(Subscriber.prototype, 'xack');
    xpendingStub = sandbox
      .stub(PendingEvents.prototype, 'xpending')
      .resolves(events);
    xclaimStub = sandbox.stub(PendingEvents.prototype, 'xclaim').resolves([]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('removes events that have reached maximum retries', async () => {
    const subscriber = new Subscriber(testConfig);
    const pendingEvents = new PendingEvents(subscriber);
    pendingEvents._pendingEvents = events;
    await pendingEvents._removeMaxRetries();
    // this will remove the event with the 4 retries.
    expect(pendingEvents._pendingEvents.length).equals(7);
    expect(xackStub.calledOnce).equals(true);
  });

  it('processes pending events', async () => {
    const subscriber = new Subscriber(testConfig);
    const pendingEvents = new PendingEvents(subscriber);
    await pendingEvents.processPendingEvents();
    // this will remove the event with the 4 retries.
    expect(xpendingStub.calledOnce, 'xpendingStub should be called').equals(
      true
    );
    expect(xclaimStub.calledOnce, 'xclaimStub should be called').equals(true);
  });
});
