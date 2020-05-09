const { expect } = require('chai');
const faker = require('faker');

describe('RedPop Integration Tests', () => {
  let RedPop;
  before(() => {
    RedPop = require('.');
  });
  after(() => {
    RedPop = null;
  });

  describe('RedPop Integration Tests - Positive', () => {
    it('RedPop::xlen returns an integer', async () => {
      const redPop = new RedPop();
      const length = await redPop.xlen();
      expect(length).to.be.a('Number');
    });

    it('successfully xadd and xdelete an event', async () => {
      // Build an event with multiple keys. Each key as a different data type
      // including string, number, date, image, and JSON object.
      const jsonText = `{
          "${faker.lorem.word()}": "${faker.lorem.word()}",
          "${faker.lorem.word()}": "${faker.random.number()}",
          "${faker.lorem.word()}": "${faker.date.past()}",
          "${faker.lorem.word()}": "${faker.image.image()}",
          "${faker.lorem.word()}": {"${faker.lorem.word()}": "${faker.lorem.word()}"}}
      `;
      const jsonEvent = JSON.parse(jsonText);

      // Get a new RedPop instance and add an event
      const redPop = new RedPop();
      // Store the current length of the stream
      const lengthBefore = await redPop.xlen();
      // Add an event - validate and store the event Id
      const eventId = await redPop.xadd(jsonEvent);
      expect(eventId).to.be.a('String');
      expect(eventId.length).equals(15);
      // Verify the new length of the stream is > than before
      expect(await redPop.xlen()).greaterThan(lengthBefore);
      // Delete the new event and verify stream-length goes back to pre-add length
      await redPop.xdel(eventId);
      expect(await redPop.xlen()).equals(lengthBefore);
    });
  });
});
