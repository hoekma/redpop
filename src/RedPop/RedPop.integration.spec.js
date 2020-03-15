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
    it('calls successfully calls xlen', async () => {
      const redPop = new RedPop();
      const length = await redPop.xlen();
      expect(length).to.be.a('Number');
    });

    it('successfully adds a message with xadd', async () => {
      const jsonText = `{
          "${faker.lorem.word()}": "${faker.lorem.word()}",
          "${faker.lorem.word()}": "${faker.random.number()}",
          "${faker.lorem.word()}": "${faker.date.past()}",
          "${faker.lorem.word()}": "${faker.image.image()}",
          
          "${faker.lorem.word()}": {"${faker.lorem.word()}": "${faker.lorem.word()}"}}
      `;

      const jsonMessage = JSON.parse(jsonText);
      const redPop = new RedPop();
      const lengthBefore = await redPop.xlen();
      const messageId = await redPop.xadd(jsonMessage);
      expect(messageId).to.be.a('String');
      expect(messageId.length).equals(15);
      const lengthAfter = await redPop.xlen();
      expect(lengthAfter).greaterThan(lengthBefore);
    });
  });
});
