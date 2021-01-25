// Note -- you can choose between the two servers listed by
// uncommenting one at a time to test cluster mode vs. stanalone mode

module.exports = {
  server: {
    connectionType: 'cluster',
    connections: [{ port: 7000, host: '127.0.0.1' }],
    connection: { port: 6379, host: 'localhost' },
    options: {
      scaleRedis: 'slave'
    }
    // password: 'defaultpass'
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
    idleConsumerTimeoutMs: 10000,
    eventMaximumReplays: 3
  }
};
