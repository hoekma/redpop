const RedPop = require('../RedPop');
const EventBatch = require('./EventBatch/EventBatch');
const PendingEvents = require('./PendingEvents');
const IdleConsumers = require('./IdleConsumers');
const nanoid = require('nanoid');
const defaultConfig = require('./config');
const cloneDeep = require('lodash/cloneDeep');

/**
 * Consumer is an abstract class that encapsulates
 * the functionalty to run a consumer.  A subclass
 * should extend this class and override the abstract
 * method(s).  At a minimum, processEvent should be extended.
 *
 */
class Consumer extends RedPop {
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
   * Sets consumer specific configuration settings
   */
  setConfig() {
    const consumer = this.config.consumer;
    const defConsumer = defaultConfig.consumer;

    consumer.name = this.config.consumer.name + '_' + nanoid.nanoid();
    consumer.waitTimeMs = consumer.waitTimeMs || defConsumer.waitTimeMs;
    consumer.batchSize = consumer.batchSize || defConsumer.batchSize;
    consumer.idleTimeoutMs = consumer.idleTimeoutMs || defConsumer.batchSize;
    consumer.eventMaximumReplays =
      consumer.eventMaximumReplays || defConsumer.eventMaximumReplays;
  }

  /**
   * processEvents
   *
   * Processes a batch of events calling the users. utiltiy processEvent()
   * be overridden in a subclass
   *
   * @param {Object} events - Array of events received via ioredis.
   *
   */

  async _processEvents(batch) {
    Promise.all(
      batch.getEvents().map(async event => {
        const result = await this.processEvent(event);
        if (result) {
          await this.xack(event.id);
        }
      })
    );
  }

  /**
   * poll -- Main loop to poll Redis for events
   */

  async start() {
    const stream = this.config.stream;
    const consumer = this.config.consumer;
    if (!this.connected) {
      this.connect();
    }
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
        consumer.batchSize,
        'STREAMS',
        stream.name,
        '>'
      ]);

      if (!batch) {
        await this._onBatchesComplete();
      } else {
        const eventBatch = new EventBatch(batch);
        await this._onBatchReceived(eventBatch);
        await this._onBatchComplete();
      }

      if (this.config.consumer.runOnce) {
        // used for tests to break out of the loop
        // normally this loop never ends until the
        // process is terminated.
        done = true;
      }
    }

    return 'stopped';
  }

  /**
   * Events
   */

  /**
   * onBatchesComplete()
   */
  async _onBatchesComplete() {
    // Perform post-processing after all
    // events in the stream have been played
    this.processing = false;
    await this.onBatchesComplete();
    await this._processPendingEvents();
    await this._removeIdleConsumers();
  }

  /**
   * onBatchReceived()
   *   Process the new batch of events.
   *   this.processevents should be overridden in a
   *   subclass of Consumer
   */
  async _onBatchReceived(eventBatch) {
    this.processing = true;
    await this._processEvents(eventBatch);
  }

  /**
   * onBatchComplete()
   *   Perform any batch-specific post-processing
   */
  async _onBatchComplete() {
    await this.onBatchComplete();
  }

  /**
   * processPendingEvent()
   *   Process any events that were played by other
   *   consumers and didn't result in an xack.  This
   *   can happen if the subbscriber is terminated in
   *   the middle of processing an event or if an unhandled
   *   error occurs in the processEvent() call.
   */
  async _processPendingEvents() {
    const pendingEvents = new PendingEvents(this);
    await pendingEvents.processPendingEvents();
  }

  /**
   * removeIdleConsumers()
   *   Remove consumers that have been idle
   *   longer than config.consumer.idleConsumerTimeoutMs
   */
  async _removeIdleConsumers() {
    const idleConsumers = new IdleConsumers(this);
    await idleConsumers.removeIdleConsumers();
  }

  /**
  /**
   *  * Abstract Methods --  Override in sub-classes
   */

  /**
   * processEvent
   *
   */

  async processEvent(event) {
    return true;
  }

  /**
   * onBatchComplete
   *
   */
  async onBatchComplete() {
    return true;
  }

  /**
   * onBatchesComplete
   *
   */
  async onBatchesComplete() {
    return true;
  }

  /**
   * init()
   *
   */
  async init() {
    return true;
  }
}

module.exports = Consumer;
