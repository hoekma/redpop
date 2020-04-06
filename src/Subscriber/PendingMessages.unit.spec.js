const { expect } = require('chai');
const PendingMessages = require('./PendingMessages');
const Subscriber = require('../Subscriber');
const testConfig = require('./test/testConfig');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();

const messages = [
  ['1584670546084-7', 'consumerGroup_zpUUkOZdI', 1085424347, 1],
  ['1584670546084-8', 'consumerGroup_zpUUkOZdI', 1085424347, 2],
  ['1584670546084-9', 'consumerGroup_zpUUkOZdI', 1085424347, 3],
  ['1584670546084-10', 'consumerGroup_zpUUkOZdI', 1085424347, 1],
  ['1584670546085-0', 'consumerGroup_zpUUkOZdI', 1085424347, 2],
  ['1584670546085-1', 'consumerGroup_zpUUkOZdI', 1085424347, 3],
  ['1584670546085-2', 'consumerGroup_zpUUkOZdI', 1085424347, 4],
  ['1584670546085-3', 'consumerGroup_zpUUkOZdI', 1085424347, 1]
];

describe.only('PendingMessages Unit Test', () => {
  let xackStub, xpendingStub, xclaimStub;
  beforeEach(() => {
    xackStub = sandbox.stub(Subscriber.prototype, 'xack');
    xpendingStub = sandbox
      .stub(PendingMessages.prototype, 'xpending')
      .resolves(messages);
    xclaimStub = sandbox.stub(PendingMessages.prototype, 'xclaim').resolves([]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('removes messages that have reached maximum retries', async () => {
    const subscriber = new Subscriber(testConfig);
    const pendingMessages = new PendingMessages(subscriber);
    pendingMessages._pendingMessages = messages;
    await pendingMessages._removeMaxRetries();
    // this will remove the message with the 4 retries.
    expect(pendingMessages._pendingMessages.length).equals(7);
    expect(xackStub.calledOnce).equals(true);
  });

  it('processes pending messages', async () => {
    const subscriber = new Subscriber(testConfig);
    const pendingMessages = new PendingMessages(subscriber);
    await pendingMessages.processPendingMessages();
    // this will remove the message with the 4 retries.
    expect(xpendingStub.calledOnce, 'xpendingStub should be called').equals(
      true
    );
    expect(xclaimStub.calledOnce, 'xclaimStub should be called').equals(true);
  });
});
