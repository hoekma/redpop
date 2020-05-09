const { expect } = require('chai');
const shortid = require('shortid');
const cloneDeep = require('lodash/cloneDeep');
const sinon = require('sinon');
const RedPop = require('../RedPop');
const EventBatch = require('./EventBatch');
const PendingEvents = require('./PendingEvents');
const testConfig = require('./test/testConfig');
const xreadgroupResponse = require('./test/xreadgroupResponse');

const sandbox = sinon.createSandbox();

describe('Subscriber Unit Tests', () => {
  let Subscriber;
  let config;
  let xack;
  before(() => {
    Subscriber = require('.');
  });

  beforeEach(() => {
    config = cloneDeep(testConfig);
    xack = sandbox.stub(RedPop.prototype, 'xack');
    sandbox
      .stub(EventBatch.prototype, 'getEvents')
      .returns([{ streamName: 'redpop', data: { d: 'test' } }]);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Subscriber Unit Tests - Positive', () => {
    it('instantiates a subscriber', () => {
      const subscriber = new Subscriber();
      expect(subscriber.config).to.be.an('Object');
      expect(subscriber.config.server.address).to.equal('localhost');
      expect(subscriber.config.consumer.group).equals('consumerGroup');
    });

    it('generates a unique consumer name', () => {
      const shortidStub = sandbox.stub(shortid, 'generate').returns('random');
      const subscriber = new Subscriber(config);
      expect(
        subscriber.config.consumer.name,
        'Consumer name was not properly generated'
      ).equals(testConfig.consumer.name + '_random');
      expect(shortidStub.calledOnce).equals(true);
    });

    it('sets processing=false after _onBatchesComplete()', async () => {
      const subscriber = new Subscriber(config);
      subscriber.processing = true;
      await subscriber._onBatchesComplete();
      expect((subscriber.processing = false));
    });

    it('has abstract method processEvent', async () => {
      const subscriber = new Subscriber(config);
      const result = await subscriber.processEvent();
      expect(result).equals(true);
    });

    it('has abstract method afterBatchComplete', async () => {
      const subscriber = new Subscriber(config);
      const result = await subscriber.onBatchComplete();
      expect(result).equals(true);
    });

    it('has abstract method afterBatchesComplete', async () => {
      const subscriber = new Subscriber(config);
      const result = await subscriber.onBatchesComplete();
      expect(result).equals(true);
    });

    it('runs _onBatchComplete()', async () => {
      const afterBatchComplete = sandbox.stub(
        Subscriber.prototype,
        'onBatchComplete'
      );
      const subscriber = new Subscriber(config);
      await subscriber._onBatchComplete();
      expect(afterBatchComplete.calledOnce).equals(true);
    });

    it('runs onBatchComplete()', async () => {
      const subscriber = new Subscriber(config);
      await subscriber.onBatchComplete();
    });

    it('runs _processEvents', async () => {
      const subscriber = new Subscriber(config);
      const eventBatch = new EventBatch(xreadgroupResponse);
      await subscriber._processEvents(eventBatch);
      expect(xack.calledOnce).equals(true);
    });

    it('runs _onBatchReceived', async () => {
      const subscriber = new Subscriber(config);
      const eventBatch = new EventBatch(xreadgroupResponse);
      await subscriber._onBatchReceived(eventBatch);
      expect(xack.calledOnce).equals(true);
    });

    it('runs _init', async () => {
      const initStub = sandbox.stub(Subscriber.prototype, 'init');
      const xgroupStub = sandbox.stub(RedPop.prototype, 'xgroup');
      const subscriber = new Subscriber(config);
      await subscriber._init();
      expect(initStub.calledOnce).equals(true);
      expect(xgroupStub.calledOnce).equals(true);
    });

    it('runs abstract method init', async () => {
      const subscriber = new Subscriber(config);
      await subscriber.init();
    });

    it('starts the subscriber and plays an event', async () => {
      const xreadgroup = sandbox
        .stub(RedPop.prototype, 'xreadgroup')
        .resolves(xreadgroupResponse);
      const xgroupStub = sandbox.stub(RedPop.prototype, 'xgroup');
      const subscriber = new Subscriber(config);
      await subscriber.start();
      expect(xreadgroup.calledOnce).equals(true);
      expect(xgroupStub.calledOnce).equals(true);
    });

    it('starts the subscriber and completes batches', async () => {
      const xreadgroupStub = sandbox
        .stub(RedPop.prototype, 'xreadgroup')
        .resolves(null);
      const xgroupStub = sandbox.stub(RedPop.prototype, 'xgroup');
      const pendingEventsStub = sandbox.stub(
        PendingEvents.prototype,
        'processPendingEvents'
      );
      const subscriber = new Subscriber(config);
      await subscriber.start();
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
