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
    name: 'testGroup' // consumer name
  },
  testing: true
};
