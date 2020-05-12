module.exports = {
  server: {
    address: 'localhost',
    port: 6379,
    connectionType: 'standalone'
  },
  stream: {
    name: 'redpopdemo'
  },
  consumer: {
    group: 'demoConsumerGroup',
    name: 'demoConsumerGroup',
    waitTimeMs: 2000,
    batchSize: 50,
    pendingEventTimeoutMs: 10000,
    idleSubscriberTimeoutMs: 10000,
    eventMaximumReplays: 3
  }
};
