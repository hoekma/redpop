const RedPop = require('../RedPop');

class Publisher extends RedPop {
  async publish(event, stream) {
    if (!this.connected) {
      this.connect();
    }
    let streamName = this.config?.stream?.name;
    if (stream) {
      streamName = stream;
    }
    return this.xadd(event, streamName);
  }
}

module.exports = Publisher;
