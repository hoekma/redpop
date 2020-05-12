const isEmpty = require('lodash/isEmpty');
const { expect } = require('chai');
const sandbox = require('sinon').createSandbox();
const PendingEvents = require('./PendingEvents');
const Subscriber = require('../Subscriber');
const Publisher = require('../../Publisher');
const RedPop = require('../../RedPop');
const config = require('../test/testConfig');

// Timer to wait for a certain amount of time.
const wait = ms => {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
};

// This is our subscriber class for the tests
class PendingMessageTestSubscriber extends Subscriber {
  constructor(config) {
    super(config);
    this.sendxack = false;
  }

  async processEvent(event) {
    // this should leave
    return this.sendxack;
  }
}

describe('PendingEvents Integration Tests', () => {
  beforeEach(async () => {
    // Make sure it's trimmed to 0 if it already existed
    const redPop = new RedPop(config);

    // Create the stream
    try {
      redPop.xgroup('DESTROY', config.stream.name, config.consumer.group);
    } catch (e) {}

    try {
      await redPop.xgroup(
        'CREATE',
        config.stream.name,
        config.consumer.group,
        '$',
        'MKSTREAM'
      );
    } catch (e) {}

    await redPop.xtrim(0);

    // Establish a subscriber group
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

    const pendingMessages = await redPop.xpending();
    expect(
      isEmpty(pendingMessages),
      'beforeEach - Pending messages should not exist'
    ).equals(true);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('PendingEvents - Postive Tests', () => {
    it('processes pending events', async () => {
      // Publish a message
      const publisher = new Publisher(config);
      await publisher.publish({ v: 'test' });

      // Let the subscriber play the message
      const subscriber = new PendingMessageTestSubscriber(config);
      await subscriber.start();

      // Verify that there is a pending message
      let pendingMessages = await subscriber.xpending();
      expect(isEmpty(pendingMessages), 'Pending messages should exist').equals(
        false
      );

      // Wait for the pending message timeout to pass
      wait(config.consumer.pendingEventTimeoutMs + 100);

      // Now that we're set up, let's try to replay the message after
      // two seconds;

      subscriber.sendxack = true; // Let it xack the message this time
      const pendingEvent = new PendingEvents(subscriber);
      await pendingEvent.processPendingEvents();
      pendingMessages = await subscriber.xpending();

      expect(
        isEmpty(pendingMessages),
        'Pending messages should not exist'
      ).equals(true);
    });
  });
});
