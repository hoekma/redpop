const RedPop = require('../RedPop');
const shortid = require('shortid');
const defaultConfig = require('./config');
const cloneDeep = require('lodash/cloneDeep');

/**
 * Subscriber is an abstract class that encapsulates
 * the functionalty to run a subscriber.  A subclass
 * should extend this class and override the abstract
 * method(s).  At a minimum, processMessage should be extended.
 *
 */
class Subscriber extends RedPop {
  constructor(config) {
    config = config || cloneDeep(defaultConfig);

    // process configuration in parent class RedPop
    super(config);
    this.setConsumerName();
    this.processing = false;
  }

  /**
   * setConsumeName - assigns a unique consumer name
   */

  setConsumerName() {
    this.config.consumer.consumerName =
      this.config.consumer.consumerName + '_' + shortid.generate();
  }

  /**
   * processMessages
   *
   * @param {Object} messages - Array of messages received via ioredis.
   * Processes a batch of messages calling the users. utiltiy processMessage()
   * be overridden in a subclass
   */

  async processMessages(messages) {
    Promise.all(
      messages.map(async message => {
        const result = await this.processMessage(message);
        if (result) {
          await this.xack(
            this.config.stream.name,
            this.config.consumer.group,
            message.id
          );
        }
      })
    );
  }

  /**
   * poll -- Main loop to poll Redis for messages
   */

  async start() {
    const stream = this.config.stream;
    const consumer = this.config.consumer;
    const waitTimeMs = consumer.waitTimeMs || defaultConfig.consumer.waitTimeMs;
    const messageBatchSize =
      consumer.messageBatchSize || defaultConfig.consumer.messageBatchSize;

    let done = false;

    while (!done) {
      const messages = await this.xreadgroup([
        'GROUP',
        consumer.group,
        consumer.name,
        'BLOCK',
        waitTimeMs,
        'COUNT',
        messageBatchSize,
        'STREAMS',
        stream.name,
        '>'
      ]);

      if (!messages) {
        this.onBatchesComplete();
      } else {
        this.onBatchReceived(messages);
      }

      if (this.config.testing) {
        // used for tests to break out of the loop
        // normally this loop never ends until the
        // process is terminated.
        done = true;
      }
    }
  }

  /**
   * Events
   */

  /**
   * onBatchesComplete()
   */
  async onBatchesProcessed() {
    // Perform any post-processing after all
    // pending messages in the stream have been played
    this.processing = false;
  }

  /**
   * onBatchReceived()
   *   Process the new batch of messages.
   *   this.processmessages should be overridden in a
   *   subclass of Subscriber
   */
  async onBatchReceived(messages) {
    this.processing = true;
    await this.processMessages(messages);
    this.onBatchProcessed();
  }

  /**
   * onBatchProcessed()
   *   Perform any batch-specific post-processing
   */
  async onBatchProcessed() {
    await this.onBatchComplete();
  }

  /**
   * processPendingMessage()
   *   Process any messages that were played by other
   *   subscribers and didn't result in an xack.  This
   *   can happen if the subbscriber is terminated in
   *   the middle of processing a message or if an unhandled
   *   error occurs in the processMessage() call.
   */
  async processPendingMessages() {}

  /**
  /**
   *  * Abstract Methods --  Override in sub-classes
   */

  /**
   * processMessage
   *
   */

  async processMessage(message) {
    return true;
  }

  async onBatchComplete() {
    return true;
  }

  async onBatchesComplete() {
    return true;
  }
}

module.exports = Subscriber;
