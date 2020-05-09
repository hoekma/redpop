const Publisher = require('../../Publisher');
const event = require('./publishData');

const publisher = new Publisher();

(async () => {
  let i;
  for (i = 0; i < 1; i++) {
    await publisher.publish(event);
  }
  console.log(`Successfully published ${i} events`);
  const streamLength = await publisher.xlen();
  console.log(`Stream "redpop" now has ${streamLength} events`);
  publisher.disconnectRedis();
  process.exit();
})();
