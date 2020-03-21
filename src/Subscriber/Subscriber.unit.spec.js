const { expect } = require('chai');
const shortid = require('shortid');
const cloneDeep = require('lodash/cloneDeep');
const sinon = require('sinon');
const RedPop = require('../RedPop');
const MessageBatch = require('./MessageBatch');
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
      .stub(MessageBatch.prototype, 'getMessages')
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

    it('has abstract method processMessage', async () => {
      const subscriber = new Subscriber(config);
      const result = await subscriber.processMessage();
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

    it('runs _processMessages', async () => {
      const subscriber = new Subscriber(config);
      const messageBatch = new MessageBatch(xreadgroupResponse);
      await subscriber._processMessages(messageBatch);
      expect(xack.calledOnce).equals(true);
    });

    it('runs _onBatchReceived', async () => {
      const subscriber = new Subscriber(config);
      const messageBatch = new MessageBatch(xreadgroupResponse);
      await subscriber._onBatchReceived(messageBatch);
      expect(xack.calledOnce).equals(true);
    });

    it('runs _init', async () => {
      const initStub = sandbox.stub(Subscriber.prototype, 'init');
      const subscriber = new Subscriber(config);
      await subscriber._init();
      expect(initStub.calledOnce).equals(true);
    });

    it('runs abstract method init', async () => {
      const subscriber = new Subscriber(config);
      await subscriber.init();
    });

    it('starts the subscriber and plays a message', async () => {
      const xreadgroup = sandbox
        .stub(RedPop.prototype, 'xreadgroup')
        .resolves(xreadgroupResponse);
      const subscriber = new Subscriber(config);
      await subscriber.start();
      expect(xreadgroup.calledOnce).equals(true);
    });

    it('starts the subscriber and completes batches', async () => {
      const xreadgroup = sandbox
        .stub(RedPop.prototype, 'xreadgroup')
        .resolves(null);
      const subscriber = new Subscriber(config);
      await subscriber.start();
      expect(xreadgroup.calledOnce).equals(true);
    });
  });
});
