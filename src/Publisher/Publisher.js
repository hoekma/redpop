const RedPop = require('../RedPop');

class Publisher extends RedPop {
  async publish(event, stream) {
    let streamName = this.config.stream.name;
    if (stream) {
      streamName = stream;
    }
    return this.xadd(event, streamName);
  }
}

module.exports = Publisher;
