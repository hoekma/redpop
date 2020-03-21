const { expect } = require('chai');
const MessageBatch = require('./MessageBatch');
const xreadgroupResponse = require('./test/xreadgroupResponse');

describe('MessgeBatch Unit Test', () => {
  it('loads an ioredis message', () => {
    const messageBatch = new MessageBatch(xreadgroupResponse);
    expect(messageBatch.getStreamName()).equals('redpop');
    expect(messageBatch.getMessages()[0].id).equals(
      xreadgroupResponse[0][1][0][0]
    );
    expect(messageBatch.getMessages()[0].data.d).equals(
      xreadgroupResponse[0][1][0][1][1]
    );
  });

  it('loads an empty ioredis message', () => {
    const messages = new MessageBatch([]);
    expect(messages.getMessages()).equals(undefined);
  });
});
