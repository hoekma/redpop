const RedPop = require('../../RedPop');
const config = require('../demoConfig');

const redPop = new RedPop(config);
const BEGIN = '0'; // Sets stream pointer to the beginning
// eslint-disable-next-line no-unused-vars
const END = '$'; // Sets stream pointer to the end

(async () => {
  await redPop.xgroup(
    'SETID',
    config.stream.name,
    config.consumer.group,
    BEGIN
  );

  const streamLength = await redPop.xlen();
  console.info(`Successfully replayed ${streamLength} events`);
  redPop.disconnectRedis();
  process.exit();
})();
