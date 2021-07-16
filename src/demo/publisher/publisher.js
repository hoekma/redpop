const Publisher = require('../../Publisher');
const event = require('./publishData');
const config = require('../demoConfig');

const publisher = new Publisher(config);
const iterations = 20000;

(async () => {
  let i;
  for (i = 0; i < iterations; i++) {
    // eslint-disable-next-line no-await-in-loop
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
