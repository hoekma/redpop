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
    waitTimeMs: 2000, // Time to wait for redis events per loop
    batchSize: 50, // Number of events to receive each loop
    idleTimeoutEventMs: 600000, // Time before event should be replayed
    idleTimeoutSubscriberMs: 5400000, // Time before subscriber is de-registered
    eventMaximumReplays: 3
  },
  testing: true
};
