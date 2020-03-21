const cloneDeep = require('lodash/cloneDeep');
class MessageBatch {
  constructor(messages) {
    if (messages[0]) {
      this._loadMessages(messages[0]);
    }
  }

  /**
   * loadMessages -- breaks apart the nested arrays / objects from ioredis
   * into an easier structure to use.
   *  -- Stream name stored as a string in this.streamName
   *  -- messages stored in an array of JSON objects in this.messages
   *
   * @param {Object} messageBatch batch of messages from ioredis
   */
  _loadMessages(messageBatch) {
    this._streamName = messageBatch[0];
    this._messages = messageBatch[1].map(message => ({
      id: message[0],
      data: this._extractData(message[1])
    }));
  }

  /**
   * extractData -- Redis doesn't differentiate the data from the keys.  This
   * composes the key/value array into a JSON object
   *
   * @param {Array} dataArray - array of messages
   */
  _extractData(dataArray) {
    const dataObject = {};
    for (let dataIndex = 0; dataIndex < dataArray.length; dataIndex += 2) {
      dataObject[dataArray[dataIndex]] = dataArray[dataIndex + 1];
    }
    return dataObject;
  }

  /**
   * getMessages -- returns this.messages as an array of JSON objects
   *
   * @param {Array} dataArray - array of messages
   */
  getMessages() {
    return cloneDeep(this._messages);
  }

  /**
   * getStreamName -- returns this.messages as an array of JSON objects
   *
   * @param {Array} dataArray - array of messages
   */
  getStreamName() {
    return this._streamName;
  }
}

module.exports = MessageBatch;
