const Consumer = require('../../Consumer');
const config = require('../demoConfig');

class DemoConsumer extends Consumer {
  constructor() {
    super(config);
    this.batchCount = 0;
    this.eventCountCurrentBatch = 0;
    this.eventCountAllBatches = 0;
    this.calculateSuccessOrFail = true;
  }

  async onBatchComplete() {
    this.batchCount += 1;
    console.info(
      `Processed ${this.eventCountCurrentBatch} events in batch ${this.batchCount}`
    );
    this.eventCountCurrentBatch = 0;
  }

  async onBatchesComplete() {
    if (this.eventCountAllBatches > 0) {
      // after the initial batch, don't simulate a failure rate
      this.calculateSuccessOrFail = false;
      // It is possible that this will run before a batch count is established.
      this.batchCount = this.batchCount === 0 ? 1 : this.batchCount;
      console.info(
        `Processed ${this.eventCountAllBatches} events in ${this.batchCount} batches`
      );
      this.eventCountAllBatches = 0;
      this.batchCount = 0;
    } else {
      process.stdout.write('.');
    }
  }

  // eslint-disable-next-line no-unused-vars
  async processEvent(event) {
    let successOrFail = true;
    if (this.calculateSuccessOrFail === true) {
      // Simulate failed transactions by "failing" 10%.  Consumer
      // Should replay them after config.pendingEventTimeoutMs elapses.
      successOrFail = Math.round(Math.random() * 10) > 1;
    }

    if (successOrFail) {
      this.eventCountCurrentBatch += 1;
      this.eventCountAllBatches += 1;
    }
    return successOrFail;
  }
}

const consumer = new DemoConsumer(config);

console.info(`Starting Consumer ${consumer.config.consumer.group}`);
console.info('Press ctrl-c to exit.');
consumer.start();
