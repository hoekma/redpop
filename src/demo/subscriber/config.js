module.exports = {
  server: {
    address: 'localhost',
    port: 6379,
    connectionType: 'standalone'
  },
  stream: {
    name: 'redpop'
  },
  consumer: {
    group: 'consumerGroup',
    name: 'consumerGroup',
    waitTimeMs: 2000,
    batchSize: 50,
    idleTimeoutEventMs: 600000,
    idleTimeoutSubscriberMs: 5400000,
    eventMaximumReplays: 3
  }
};
