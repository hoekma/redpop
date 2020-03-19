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
    consumerGroup: 'consumerGroup',
    consumerName: 'consumerGroup' // set by subscriber class constructor
  }
};
