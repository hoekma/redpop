module.exports = {
  server: {
    connectionType: 'standalone',
    connections: [{ port: 7000, host: '127.0.0.1' }],
    connection: { port: 6379, host: 'localhost' },
    options: {
      scaleRedis: 'slave'
    }
    // password: 'defaultpass'
  }
};
