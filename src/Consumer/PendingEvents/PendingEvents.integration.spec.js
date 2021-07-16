const isEmpty = require('lodash/isEmpty');
const { expect } = require('chai');
const sandbox = require('sinon').createSandbox();
const PendingEvents = require('./PendingEvents');
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

// This is our consumer class for the tests
class PendingEventTestConsumer extends Consumer {
  constructor() {
    super(config);
    this.sendxack = false;
  }

  async processEvent() {
    // this should leave
    return this.sendxack;
  }
}

describe('PendingEvents Integration Tests', () => {
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

    const pendingEvents = await redPop.xpending();
    expect(
      isEmpty(pendingEvents),
      'beforeEach - Pending events should not exist'
    ).equals(true);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('PendingEvents - Postive Tests', () => {
    it('processes pending events', async () => {
      // Publish an event
      const publisher = new Publisher(config).connect();
      await publisher.publish({ v: 'test' });

      // Let the consumer play the event
      const consumer = new PendingEventTestConsumer(config);
      await consumer.start();

      // Verify that there is a pending event
      let pendingEvents = await consumer.xpending();
      expect(isEmpty(pendingEvents), 'Pending events should exist').equals(
        false
      );

      // Wait for the pending events timeout to pass
      wait(config.consumer.pendingEventTimeoutMs + 100);

      // Now that we're set up, let's try to replay the event after
      // two seconds;

      consumer.sendxack = true; // Let it xack the event this time
      const pendingEvent = new PendingEvents(consumer);
      await pendingEvent.processPendingEvents();
      pendingEvents = await consumer.xpending();

      expect(isEmpty(pendingEvents), 'Pending events should not exist').equals(
        true
      );
    });
  });
});
