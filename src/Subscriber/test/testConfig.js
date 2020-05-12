module.exports = {
  server: {
    address: 'localhost',
    port: 6379,
    connectionType: 'standalone'
  },
  stream: {
    name: 'redpoptests'
  },
  consumer: {
    group: 'testGroup', // consumer group name
    name: 'testGroup', // consumer name
    waitTimeMs: 1, // Time to wait for redis events per loop
    batchSize: 50, // Number of events to receive each loop
    pendingEventTimeoutMs: 500, // Time before event should be replayed
    idleConsumerTimeoutMs: 500, // Time before consumer is de-registered
    eventMaximumReplays: 3
  },
  testing: true
};
