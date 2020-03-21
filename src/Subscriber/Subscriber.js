const RedPop = require('../RedPop');
const MessageBatch = require('./MessageBatch');
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
    this.processing = false;
  }

  /**
   * Initializer that runs at the begin of the first subscribe batch
   */
  async _init() {
    // Ensure consumer group exists
    try {
      await this.xgroup(
        'CREATE',
        this.config.stream.name,
        this.config.consumer.group,
        '$',
        'MKSTREAM'
      );
    } catch (e) {}

    await this.init();
  }

  /**
   * setConfig
   * Sets subscriber specific configuration settings
   */
  setConfig() {
    const consumer = this.config.consumer;
    const defConsumer = defaultConfig.consumer;

    consumer.name = this.config.consumer.name + '_' + shortid.generate();

    consumer.waitTimeMs = consumer.waitTimeMs || defConsumer.waitTimeMs;

    consumer.messageBatchSize =
      consumer.messageBatchSize || defConsumer.messageBatchSize;

    consumer.idleTimeoutMs =
      consumer.idleTimeoutMs || defConsumer.messageBatchSize;

    consumer.messageMaximumReplays =
      consumer.messageMaximumReplays || defConsumer.messageMaximumReplays;
  }

  /**
   * processMessages
   *
   * @param {Object} messages - Array of messages received via ioredis.
   * Processes a batch of messages calling the users. utiltiy processMessage()
   * be overridden in a subclass
   */

  async _processMessages(batch) {
    Promise.all(
      batch.getMessages().map(async message => {
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

    await this._init();
    let done = false;

    while (!done) {
      const batch = await this.xreadgroup([
        'GROUP',
        consumer.group,
        consumer.name,
        'BLOCK',
        consumer.waitTimeMs,
        'COUNT',
        consumer.messageBatchSize,
        'STREAMS',
        stream.name,
        '>'
      ]);

      if (!batch) {
        await this._onBatchesComplete();
      } else {
        const messageBatch = new MessageBatch(batch);
        await this._onBatchReceived(messageBatch);
        await this._onBatchComplete();
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
  async _onBatchesComplete() {
    // Perform any post-processing after all
    // pending messages in the stream have been played
    console.log('All Batches Complete');
    this.processing = false;
    await this.onBatchesComplete();
  }

  /**
   * onBatchReceived()
   *   Process the new batch of messages.
   *   this.processmessages should be overridden in a
   *   subclass of Subscriber
   */
  async _onBatchReceived(messageBatch) {
    this.processing = true;
    await this._processMessages(messageBatch);
  }

  /**
   * onBatchComplete()
   *   Perform any batch-specific post-processing
   */
  async _onBatchComplete() {
    console.log('Current Batch Complete');
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
  async _processPendingMessages() {}

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

  async init() {
    return true;
  }
}

module.exports = Subscriber;
