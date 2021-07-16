const isEmpty = require('lodash/isEmpty');
const { expect } = require('chai');
const sandbox = require('sinon').createSandbox();
const IdleConsumers = require('./IdleConsumers');
const Consumer = require('../Consumer');
const Publisher = require('../../Publisher');
const RedPop = require('../../RedPop');
const config = require('../test/testConfig');

// Timer to wait for a certain amount of time.
const wait = ms => {
  const start = new Date().getTime();
  let end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
};

describe('IdleConsumers Integration Tests', () => {
  beforeEach(async () => {
    // Make sure it's trimmed to 0 if it already existed
    const redPop = new RedPop(config).connect();

    // Create the stream
    try {
      redPop.xgroup('DESTROY', config.stream.name, config.consumer.group);
    } catch (e) {
      console.log('Unexpected error running xgroup', e);
    }

    try {
      await redPop.xgroup(
        'CREATE',
        config.stream.name,
        config.consumer.group,
        '$',
        'MKSTREAM'
      );
    } catch (e) {
      console.log('Unexpected error running xgroup', e);
    }

    await redPop.xtrim(0);

    // Establish a consumer group
    await redPop.xreadgroup(
      'GROUP',
      config.consumer.group,
      config.consumer.name,
      'BLOCK',
      config.consumer.waitTimeMs,
      'COUNT',
      config.consumer.batchSize,
      'STREAMS',
      config.stream.name,
      '>'
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('IdleConsumers - Postive Tests', () => {
    it('removes an idle consumer', async () => {
      // Publish an event
      const publisher = new Publisher(config).connect();
      await publisher.publish({ v: 'test' });

      // Let the consumer play the event
      const consumer = new Consumer(config);
      await consumer.start();

      let consumers = await consumer.xinfo(
        'CONSUMERS',
        config.stream.name,
        config.consumer.group
      );

      expect(isEmpty(consumers)).equals(false);
      // Wait for the pending event timeout to pass
      wait(config.consumer.idleConsumerTimeoutMs + 100);

      // Now that we're set up, let's try to replay the event after
      // two seconds;

      const pendingEvent = new IdleConsumers(consumer);
      await pendingEvent.removeIdleConsumers();

      consumers = await consumer.xinfo(
        'CONSUMERS',
        config.stream.name,
        config.consumer.group
      );

      expect(isEmpty(consumers.length)).equals(true);
    });
  });
});
