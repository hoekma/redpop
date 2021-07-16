const chai = require('chai');
const EventBatch = require('./EventBatch');
const xreadgroupResponse = require('../test/xreadgroupResponse.mock');

chai.use(require('chai-datetime'));

const { expect } = chai;

describe('EventBatch Unit Test', () => {
  it('loads an ioredis event', () => {
    const eventBatch = new EventBatch(xreadgroupResponse);
    const event = eventBatch.getEvents()[0];
    const data = xreadgroupResponse[0][1][0][1];

    expect(eventBatch.getStreamName()).equals('redpop');
    expect(event.id).equals(xreadgroupResponse[0][1][0][0]);

    let field;

    // validate string value
    field = event.data.string;
    expect(field).to.be.a('string');
    expect(field, 'failed to parse a string').equals(JSON.parse(data[1]));

    // validate number value
    field = event.data.number;
    expect(field, 'field should be a number').to.be.a('number');
    expect(field, 'failed to parse a number').equals(JSON.parse(data[5]));

    // validate boolean value
    field = event.data.boolean;
    expect(field).to.be.a('boolean');
    expect(event.data.boolean, 'failed to parse a boolean').equals(
      JSON.parse(data[9])
    );

    // validate date value
    field = event.data.date;
    expect(field, 'eventDate should be a date').to.be.a('date');
    expect(field, 'failed to parse a date').to.equalDate(
      new Date(Date.parse(data[7]))
    );
  });

  it('loads an empty ioredis event', () => {
    const events = new EventBatch([]);
    expect(events.getEvents()).equals(undefined);
  });
});
