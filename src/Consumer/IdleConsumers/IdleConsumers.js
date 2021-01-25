const isEmpty = require('lodash/isEmpty');

// Array element numbers to make the redis responses easier to understand
const CONSUMER_NAME = 1;
const CONSUMER_IDLE_MS = 5;

// IdleConsumers will query the active consumers for the consumer group
// and remove any consumers that have been idle for longer than
// config.

class IdleConsumers {
  constructor(consumer) {
    this.consumer = consumer;
    this.config = this.consumer.config;
  }

  async removeIdleConsumers() {
    // Retrieve pending events
    // Discard pendingEvents that have been retried config.eventMaximumReplays
    const idleTimeout = this.config.consumer.idleConsumerTimeoutMs;
    const consumers = await this.consumer.xinfo(
      'CONSUMERS',
      this.config.stream.name,
      this.config.consumer.group
    );

    if (!isEmpty(consumers)) {
      Promise.all(
        consumers.filter(async consumer => {
          if (consumer[CONSUMER_IDLE_MS] > idleTimeout) {
            await this.consumer.xgroup(
              'DELCONSUMER',
              this.config.stream.name,
              this.config.consumer.group,
              consumer[CONSUMER_NAME]
            );
          }
        })
      );
    }
  }
}

module.exports = IdleConsumers;
