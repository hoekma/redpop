const RedPop = require('../RedPop');

class Publisher extends RedPop {
  async publish(event) {
    return this.xadd(event);
  }
}

module.exports = Publisher;
