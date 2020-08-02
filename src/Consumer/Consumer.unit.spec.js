const { expect } = require('chai');
const shortid = require('shortid');
const cloneDeep = require('lodash/cloneDeep');
const sandbox = require('sinon').createSandbox();
const RedPop = require('../RedPop');
const EventBatch = require('./EventBatch');
const PendingEvents = require('./PendingEvents');
const testConfig = require('./test/testConfig');
const xreadgroupResponse = require('./test/xreadgroupResponse');

describe('Consumer Unit Tests', () => {
  let Consumer;
  let config;
  let xack;
  let pendingEventsStub;

  before(() => {
    Consumer = require('.');
  });

  beforeEach(() => {
    config = cloneDeep(testConfig);
    xack = sandbox.stub(RedPop.prototype, 'xack');
    sandbox
      .stub(EventBatch.prototype, 'getEvents')
      .returns([{ streamName: 'redpop', data: { d: 'test' } }]);
    pendingEventsStub = sandbox.stub(
      PendingEvents.prototype,
      'processPendingEvents'
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Consumer Unit Tests - Positive', () => {
    it('instantiates a consumer', () => {
      const consumer = new Consumer();
      expect(consumer.config).to.be.an('Object');
      expect(consumer.config.server.address).to.equal('localhost');
      expect(consumer.config.consumer.group).equals('consumerGroup');
    });

    it('generates a unique consumer name', () => {
      const shortidStub = sandbox.stub(shortid, 'generate').returns('random');
      const consumer = new Consumer(config);
      expect(
        consumer.config.consumer.name,
        'Consumer name was not properly generated'
      ).equals(testConfig.consumer.name + '_random');
      expect(shortidStub.calledOnce).equals(true);
    });

    it.skip('sets processing=false after _onBatchesComplete()', async () => {
      const consumer = new Consumer(config);
      consumer.processing = true;
      await consumer._onBatchesComplete();
      expect((consumer.processing = false));
    });

    it('has abstract method processEvent', async () => {
      const consumer = new Consumer(config);
      const result = await consumer.processEvent();
      expect(result).equals(true);
    });

    it('has abstract method afterBatchComplete', async () => {
      const consumer = new Consumer(config);
      const result = await consumer.onBatchComplete();
      expect(result).equals(true);
    });

    it('has abstract method afterBatchesComplete', async () => {
      const consumer = new Consumer(config);
      const result = await consumer.onBatchesComplete();
      expect(result).equals(true);
    });

    it('runs _onBatchComplete()', async () => {
      const afterBatchComplete = sandbox.stub(
        Consumer.prototype,
        'onBatchComplete'
      );
      const consumer = new Consumer(config);
      await consumer._onBatchComplete();
      expect(afterBatchComplete.calledOnce).equals(true);
    });

    it('runs onBatchComplete()', async () => {
      const consumer = new Consumer(config);
      await consumer.onBatchComplete();
    });

    it('runs _processEvents', async () => {
      const consumer = new Consumer(config);
      const eventBatch = new EventBatch(xreadgroupResponse);
      await consumer._processEvents(eventBatch);
      expect(xack.calledOnce).equals(true);
    });

    it('runs _onBatchReceived', async () => {
      const consumer = new Consumer(config);
      const eventBatch = new EventBatch(xreadgroupResponse);
      await consumer._onBatchReceived(eventBatch);
      expect(xack.calledOnce).equals(true);
    });

    it('runs _init', async () => {
      const initStub = sandbox.stub(Consumer.prototype, 'init');
      const xgroupStub = sandbox.stub(RedPop.prototype, 'xgroup');
      const consumer = new Consumer(config);
      await consumer._init();
      expect(initStub.calledOnce).equals(true);
      expect(xgroupStub.calledOnce).equals(true);
    });

    it('runs abstract method init', async () => {
      const consumer = new Consumer(config);
      await consumer.init();
    });

    it('starts the consumer and plays an event', async () => {
      const xreadgroup = sandbox
        .stub(RedPop.prototype, 'xreadgroup')
        .resolves(xreadgroupResponse);
      const xgroupStub = sandbox.stub(RedPop.prototype, 'xgroup');
      const consumer = new Consumer(config);
      await consumer.start();
      expect(xreadgroup.calledOnce).equals(true);
      expect(xgroupStub.calledOnce).equals(true);
    });

    it.skip('starts the consumer and completes batches', async () => {
      const xreadgroupStub = sandbox
        .stub(RedPop.prototype, 'xreadgroup')
        .resolves(null);
      const xgroupStub = sandbox.stub(RedPop.prototype, 'xgroup');
      const consumer = new Consumer(config);
      await consumer.start();
      expect(
        xreadgroupStub.calledOnce,
        'xreadgroup should have been called'
      ).equals(true);
      expect(
        xgroupStub.calledOnce,
        'xgroupStub should have been called'
      ).equals(true);
      expect(
        pendingEventsStub.calledOnce,
        'pendingEventsStub should have been called'
      ).equals(true);
    });
  });
});
