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
    group: 'testGroup', // consumer group name
    name: 'testGroup', // consumer name
    waitTimeMs: 2000, // Time to wait for redis messages per loop
    batchSize: 50, // Number of messages to receive each loop
    idleTimeoutMessageMs: 600000, // Time before message should be replayed
    idleTimeoutSubscriberMs: 5400000, // Time before subscriber is de-registered
    messageMaximumReplays: 3
  },
  testing: true
};
