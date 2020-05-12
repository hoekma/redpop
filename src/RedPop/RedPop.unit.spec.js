const { expect } = require('chai');
const Redis = require('ioredis');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

describe('RedPop Unit Tests', () => {
  let RedPop,
    xaddStub,
    xackStub,
    xreadgroupStub,
    xdelStub,
    xlenStub,
    xtrimStub,
    xclaimStub;
  before(() => {
    RedPop = require('.');
  });
  beforeEach(() => {
    xaddStub = sandbox.stub(Redis.prototype, 'xadd').resolves('eventId');
    xackStub = sandbox.stub(Redis.prototype, 'xack').resolves('eventId');
    xdelStub = sandbox.stub(Redis.prototype, 'xdel').resolves('eventId');
    xlenStub = sandbox.stub(Redis.prototype, 'xlen').resolves('eventId');
    xtrimStub = sandbox.stub(Redis.prototype, 'xtrim').resolves(1);
    xclaimStub = sandbox.stub(Redis.prototype, 'xclaim').resolves([]);
    xreadgroupStub = sandbox
      .stub(Redis.prototype, 'xreadgroup')
      .resolves('eventId');
  });

  afterEach(() => {
    sandbox.restore();
  });
  after(() => {
    RedPop = null;
  });

  it('instantiates without a config parameter', () => {
    const redPop = new RedPop();
    expect(redPop.config).is.an('Object');
    expect(redPop.config.server.address).equals('localhost');
  });

  it('instantiates with a config parameter', () => {
    const config = {
      server: {
        address: 'someAddress',
        type: 'cluster',
        port: 9999
      },
      stream: {
        name: 'someStream'
      }
    };
    const redPop = new RedPop(config);
    expect(redPop.config).is.an('Object');
    expect(redPop.config.server.address).equals('someAddress');
    expect(redPop.config.server.port).equals(9999);
    expect(redPop.config.server.type).equals('cluster');
    expect(redPop.config.stream.name).equals('someStream');
  });

  it('calls xlen', async () => {
    const redPop = new RedPop();
    await redPop.xlen();
    expect(xlenStub.calledOnce).equals(true);
  });

  it('calls xdel', async () => {
    const redPop = new RedPop();
    await redPop.xdel();
    expect(xdelStub.calledOnce).equals(true);
  });

  it('calls xadd', async () => {
    const redPop = new RedPop();
    await redPop.xadd([{ v: 'test', n: 12, j: { t: 'test' } }]);
    expect(xaddStub.calledOnce).equals(true);
  });

  it('calls xtrim', async () => {
    const redPop = new RedPop();
    const numberTrimmed = await redPop.xtrim(10);
    expect(xtrimStub.calledOnce).equals(true);
    expect(numberTrimmed).equals(1);
  });

  it('calls xack', async () => {
    const redPop = new RedPop();
    await redPop.xack('eventId', 'stream', 'group');
    expect(xackStub.calledOnce).equals(true);
  });

  it('calls xreadgroup', async () => {
    const redPop = new RedPop();
    await redPop.xreadgroup([
      'GROUP',
      'groupname',
      'consumername',
      'BLOCK',
      2000,
      'COUNT',
      50,
      'STREAMS',
      'streamname',
      '>'
    ]);
    expect(xreadgroupStub.calledOnce).equals(true);
  });

  it('calls xclaim', async () => {
    const config = require('./test/testConfig');
    const redPop = new RedPop(config);
    const xclaimedMessages = await redPop.xclaim([12345]);
    expect(xclaimStub.calledOnce).equals(true);
    expect(Array.isArray(xclaimedMessages)).equals(true);
  });
});
