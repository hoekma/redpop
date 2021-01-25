module.exports = {
  server: {
    connectionType: 'standalone',
    connections: [{ port: 7000, host: 'localhost' }],
    connection: { port: 6379, host: 'localhost' },
    options: {}
    // password: 'defaultpass'
  },
  stream: {
    name: 'redpop'
  },
  consumer: {
    group: 'testGroup', // consumer group name
    name: 'testGroup', // consumer name
    waitTimeMs: 1, // Time to wait for redis events per loop
    batchSize: 50, // Number of events to receive each loop
    pendingEventTimeoutMs: 500, // Time before event should be replayed
    idleConsumerTimeoutMs: 500, // Time before consumer is de-registered
    eventMaximumReplays: 3, // maximum number of times to replay failed events
    runOnce: true // true = poll for event once and stop. false = poll / loop indefinitely
  }
};
