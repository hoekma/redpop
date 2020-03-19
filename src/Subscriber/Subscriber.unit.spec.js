const { expect } = require('chai');
const shortid = require('shortid');
const cloneDeep = require('lodash/cloneDeep');
const sinon = require('sinon');
const RedPop = require('../RedPop');
const testConfig = require('./test/testConfig');

const sandbox = sinon.createSandbox();

describe('Subscriber Unit Tests', () => {
  let Subscriber;
  let config;

  before(() => {
    Subscriber = require('.');
  });

  beforeEach(() => {
    config = cloneDeep(testConfig);
  });

  afterEach(() => {
    sandbox.restore();
  });
  describe('Subscriber Unit Tests - Positive', () => {
    it('instantiates a subscriber', () => {
      const subscriber = new Subscriber();
      expect(subscriber.config).to.be.an('Object');
      expect(subscriber.config.server.address).to.equal('localhost');
      expect(subscriber.config.consumer.consumerGroup).equals('consumerGroup');
    });

    it('generates a unique consumerName', () => {
      const shortidStub = sandbox.stub(shortid, 'generate').returns('random');
      const subscriber = new Subscriber(config);
      expect(
        subscriber.config.consumer.consumerName,
        'Consumer name was not properly generated'
      ).equals(testConfig.consumer.consumerName + '_random');
      expect(shortidStub.calledOnce).equals(true);
    });
    it('sets processing=false after onBatchesComplete()', async () => {
      const subscriber = new Subscriber(config);
      subscriber.processing = true;
      await subscriber.onBatchesComplete();
      expect((subscriber.processing = false));
    });
    it('has abstract method processMessage', async () => {
      const subscriber = new Subscriber(config);
      const result = await subscriber.processMessage();
      expect(result).equals(true);
    });
    it('has abstract method afteBatchComplete', async () => {
      const subscriber = new Subscriber(config);
      const result = await subscriber.onBatchComplete();
      expect(result).equals(true);
    });
    it('has abstract method afterBatchesComplete', async () => {
      const subscriber = new Subscriber(config);
      const result = await subscriber.onBatchesComplete();
      expect(result).equals(true);
    });
    it('runs onBatchprocessed()', async () => {
      const afterBatchComplete = sandbox.stub(
        Subscriber.prototype,
        'onBatchComplete'
      );
      const subscriber = new Subscriber(config);
      await subscriber.onBatchProcessed();
      expect(afterBatchComplete.calledOnce).equals(true);
    });
    it('runs processMessages', async () => {
      const xack = sandbox.stub(RedPop.prototype, 'xack');
      const subscriber = new Subscriber(config);
      const messages = [{}];
      await subscriber.processMessages(messages);
      expect(xack.calledOnce).equals(true);
    });
  });
});
