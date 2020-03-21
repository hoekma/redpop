const Subscriber = require('../../Subscriber');
const config = require('./config');

class DemoSubscriber extends Subscriber {
  constructor(config) {
    super(config);
    this.batchCount = 0;
    this.messageCountCurrentBatch = 0;
    this.messageCountAllBatches = 0;
  }

  async _onBatchComplete() {
    console.log(
      `Processed ${this.messageCountCurrentBatch} messages in batch ${this.batchCount}`
    );
    this.batchCount++;
    this.messageCountCurrentBatch = 0;
  }

  async _onBatchesComplete() {
    if (this.messageCountAllBatches > 0) {
      console.log(
        `Processed ${this.messageCountAllBatches} messages in ${this
          .batchCount - 1} batches`
      );
      this.messageCountAllBatches = 0;
      this.batchCount = 0;
    } else {
      process.stdout.write('.');
    }
  }

  async processMessage(message) {
    this.messageCountCurrentBatch++;
    this.messageCountAllBatches++;
    return true;
  }
}

const subscriber = new DemoSubscriber(config);

console.log('Starting Subscriber.');
console.log('Press ctl-c to exit.');
subscriber.start();
