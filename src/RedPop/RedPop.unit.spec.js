const { expect } = require('chai');

describe('RedPop Unit Tests', () => {
  let RedPop;
  before(() => {
    RedPop = require('.');
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
});
