const Publisher = require('../../Publisher');
const message = require('./publishData');

const publisher = new Publisher();

(async () => {
  let i;
  for (i = 0; i < 1; i++) {
    await publisher.publish(message);
  }
  console.log(`Successfully published ${i} messages`);
  const streamLength = await publisher.xlen();
  console.log(`Stream "redpop" now has ${streamLength} messages`);
  publisher.disconnectRedis();
  process.exit();
})();
