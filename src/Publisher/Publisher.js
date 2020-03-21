const RedPop = require('../RedPop');

class Publisher extends RedPop {
  async publish(message) {
    return this.xadd(message);
  }
}

module.exports = Publisher;
