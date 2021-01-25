module.exports = {
  server: {
    connectionType: 'standalone',
    connection: {
      host: 'localhost',
      port: 6379
    },
    connections: [{ port: 7000, host: '127.0.0.1' }]

    // password: 'defaultpass'
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
    eventMaximumReplays: 3, // Maximum number of retries for an event
    runOnce: true // true = poll for events once and stop. false = loop indefinitely
  }
};
