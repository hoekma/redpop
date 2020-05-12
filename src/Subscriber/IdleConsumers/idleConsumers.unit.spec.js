const { expect } = require('chai');
const Subscriber = require('..');
const IdleConsumers = require('.');
const testConfig = require('../test/testConfig');
const sandbox = require('sinon').createSandbox();

describe('PendingEvents Unit Test', () => {
  let xinfoStub, xgroupStub, subscriber;

  beforeEach(() => {
    subscriber = new Subscriber(testConfig);
    xgroupStub = sandbox.stub(IdleConsumers.prototype, 'xgroup');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('IdleConsumers - Postive Tests', () => {
    beforeEach(() => {
      const consumers = [['name', 'consumer1', 'pending', 0, 'idle', 600]];
      xinfoStub = sandbox
        .stub(IdleConsumers.prototype, 'xinfo')
        .resolves(consumers);
    });

    it('removes events that have reached maximum retries', async () => {
      const idleConsumers = new IdleConsumers(subscriber);
      await idleConsumers.removeIdleConsumers();
      expect(xinfoStub.calledOnce, 'xinfoStub should be called').equals(true);
      expect(xgroupStub.calledOnce, 'xgroupStub should be called').equals(true);
    });
  });

  describe('IdleConsumers - Negative Tests', () => {
    it('skips events that have reached maximum retries', async () => {
      const consumers = [['name', 'consumer1', 'pending', 0, 'idle', 200]];
      xinfoStub = sandbox
        .stub(IdleConsumers.prototype, 'xinfo')
        .resolves(consumers);

      const idleConsumers = new IdleConsumers(subscriber);
      await idleConsumers.removeIdleConsumers();
      expect(xinfoStub.calledOnce, 'xinfoStub should be called').equals(true);
      expect(xgroupStub.calledOnce, 'xgroupStub should not be called').equals(
        false
      );
    });
    it('handles calls without active consumers', async () => {
      const consumers = [];
      xinfoStub = sandbox
        .stub(IdleConsumers.prototype, 'xinfo')
        .resolves(consumers);

      const idleConsumers = new IdleConsumers(subscriber);
      await idleConsumers.removeIdleConsumers();
      expect(xinfoStub.calledOnce, 'xinfoStub should be called').equals(true);
      expect(xgroupStub.calledOnce, 'xgroupStub should not be called').equals(
        false
      );
    });
  });
});
