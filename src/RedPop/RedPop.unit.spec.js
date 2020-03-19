const { expect } = require('chai');
const Redis = require('ioredis');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

describe('RedPop Unit Tests', () => {
  let RedPop;
  let xaddStub, xackStub, xreadgroupStub, xdelStub, xlenStub;
  before(() => {
    RedPop = require('.');
    xaddStub = sandbox.stub(Redis.prototype, 'xadd').resolves('messageId');
    xackStub = sandbox.stub(Redis.prototype, 'xack').resolves('messageId');
    xreadgroupStub = sandbox
      .stub(Redis.prototype, 'xreadgroup')
      .resolves('messageId');
    xdelStub = sandbox.stub(Redis.prototype, 'xdel').resolves('messageId');
    xlenStub = sandbox.stub(Redis.prototype, 'xlen').resolves('messageId');
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

  it('calls xack', async () => {
    const redPop = new RedPop();
    await redPop.xack('stream', 'group', 'messageId');
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
});
