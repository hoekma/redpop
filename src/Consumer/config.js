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
    idleEventTimeoutMs: 600000,
    idleConsumererTimeoutMs: 5400000,
    messageMaximumReplays: 3
  }
};
