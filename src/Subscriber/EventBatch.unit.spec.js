const { expect } = require('chai');
const EventBatch = require('./EventBatch');
const xreadgroupResponse = require('./test/xreadgroupResponse');

describe('MessgeBatch Unit Test', () => {
  it('loads an ioredis event', () => {
    const eventBatch = new EventBatch(xreadgroupResponse);
    expect(eventBatch.getStreamName()).equals('redpop');
    expect(eventBatch.getEvents()[0].id).equals(xreadgroupResponse[0][1][0][0]);
    expect(eventBatch.getEvents()[0].data.d).equals(
      xreadgroupResponse[0][1][0][1][1]
    );
  });

  it('loads an empty ioredis event', () => {
    const events = new EventBatch([]);
    expect(events.getEvents()).equals(undefined);
  });
});
