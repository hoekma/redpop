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
    name: 'consumerGroup'
  }
};
