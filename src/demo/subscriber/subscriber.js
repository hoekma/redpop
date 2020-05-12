const Subscriber = require('../../Subscriber');
const config = require('./demoConfig');

class DemoSubscriber extends Subscriber {
  constructor(config) {
    super(config);
    this.batchCount = 0;
    this.eventCountCurrentBatch = 0;
    this.eventCountAllBatches = 0;
    this.calculateSuccessOrFail = true;
  }

  async onBatchComplete() {
    this.batchCount++;
    console.info(
      `Processed ${this.eventCountCurrentBatch} events in batch ${this.batchCount}`
    );
    this.eventCountCurrentBatch = 0;
  }

  async onBatchesComplete() {
    if (this.eventCountAllBatches > 0) {
      // after the initial batch, don't simulate a failure rate
      this.calculateSuccessOrFail = false;
      console.info(
        `Processed ${this.eventCountAllBatches} events in ${this.batchCount} batches`
      );
      this.eventCountAllBatches = 0;
      this.batchCount = 0;
    } else {
      process.stdout.write('.');
    }
  }

  async processEvent(event) {
    this.eventCountCurrentBatch++;
    this.eventCountAllBatches++;

    let successOrFail = true;

    if (this.calculateSuccessOrFail === true) {
      // Simulate failed transactions by "failing" 10%.  Subscriber
      // Should replay them after config.pendingEventTimeoutMs elapses.
      successOrFail = Math.round(Math.random() * 10) === 10;
    }
    return successOrFail;
  }
}

const subscriber = new DemoSubscriber(config);

console.info('Starting Subscriber.');
console.info('Press ctrl-c to exit.');
subscriber.start();
