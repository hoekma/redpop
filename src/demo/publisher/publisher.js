const Publisher = require('../../Publisher');
const event = require('./publishData');

const config = {
  server: {
    address: 'localhost',
    port: 6379,
    connectionType: 'standalone'
  },
  stream: {
    name: 'redpopdemo'
  }
};

const publisher = new Publisher(config);
const iterations = 50;

(async () => {
  let i;
  for (i = 0; i < iterations; i++) {
    await publisher.publish(event);
  }
  console.info(`Successfully published ${i} events`);
  const streamLength = await publisher.xlen();
  console.info(
    `Stream ${publisher.config.stream.name} now has ${streamLength} events`
  );
  publisher.disconnectRedis();
  process.exit();
})();
