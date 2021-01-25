const { expect } = require('chai');
const PendingEvents = require('./PendingEvents');
const Consumer = require('..');
const RedPop = require('../../RedPop');

const testConfig = require('../test/testConfig');
const xreadgroupResponse = require('../test/xreadgroupResponse.mock');
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
    xackStub = sandbox.stub(Consumer.prototype, 'xack');
    sandbox.stub(Consumer.prototype, 'xgroup').resolves({});
    xclaimStub = sandbox
      .stub(RedPop.prototype, 'xclaim')
      .resolves(xreadgroupResponse[0][1]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('PendingEvents - Postive Tests', () => {
    beforeEach(() => {
      xpendingStub = sandbox
        .stub(RedPop.prototype, 'xpending')
        .resolves(events);
    });

    it('removes events that have reached maximum retries', async () => {
      const consumer = new Consumer(testConfig);
      const pendingEvents = new PendingEvents(consumer);
      pendingEvents._pendingEvents = events;
      await pendingEvents._removeMaxRetries();

      // this should remove the event with the 4 retries.
      expect(pendingEvents._pendingEvents.length).equals(7);
      expect(xackStub.calledOnce).equals(true);
    });

    it('processes pending events', async () => {
      const consumer = new Consumer(testConfig);
      const pendingEvents = new PendingEvents(consumer);
      await pendingEvents.processPendingEvents();
      // this should process the remaining events.
      expect(xpendingStub.calledOnce, 'xpendingStub should be called').equals(
        true
      );
      expect(xclaimStub.calledOnce, 'xclaimStub should be called').equals(true);
    });
  });

  describe('PendingEvents - Negative Tests', () => {
    beforeEach(() => {
      xpendingStub = sandbox.stub(RedPop.prototype, 'xpending').resolves([]);
    });

    it('handles an empty batch of  pending events', async () => {
      const consumer = new Consumer(testConfig);
      const pendingEvents = new PendingEvents(consumer);
      await pendingEvents.processPendingEvents();
      // this should process the remaining events.
      expect(xpendingStub.calledOnce, 'xpendingStub should be called').equals(
        true
      );
      expect(xclaimStub.calledOnce, 'xclaimStub should not be called').equals(
        false
      );
    });
  });
});
