const Subscriber = require('../../Subscriber');
const config = require('./config');

class DemoSubscriber extends Subscriber {
  constructor(config) {
    super(config);
    this.batchCount = 0;
    this.eventCountCurrentBatch = 0;
    this.eventCountAllBatches = 0;
  }

  async onBatchComplete() {
    console.log(
      `Processed ${this.eventCountCurrentBatch} events in batch ${this.batchCount}`
    );
    this.batchCount++;
    this.eventCountCurrentBatch = 0;
  }

  async onBatchesComplete() {
    if (this.eventCountAllBatches > 0) {
      console.log(
        `Processed ${this.eventCountAllBatches} events in ${this.batchCount -
          1} batches`
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
    return true;
  }
}

const subscriber = new DemoSubscriber(config);

console.log('Starting Subscriber.');
console.log('Press ctl-c to exit.');
subscriber.start();
