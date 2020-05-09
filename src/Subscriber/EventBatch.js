const cloneDeep = require('lodash/cloneDeep');
class EventBatch {
  constructor(events) {
    if (events[0]) {
      this._loadEvents(events[0]);
    }
  }

  /**
   * loadEvents -- breaks apart the nested arrays / objects from ioredis
   * into an easier structure to use.
   *  -- Stream name stored as a string in this.streamName
   *  -- events stored in an array of JSON objects in this.events
   *
   * @param {Object} eventBatch batch of events from ioredis
   */
  _loadEvents(eventBatch) {
    this._streamName = eventBatch[0];
    this._events = eventBatch[1].map(event => ({
      id: event[0],
      data: this._extractData(event[1])
    }));
  }

  /**
   * extractData -- Redis doesn't differentiate the data from the keys.  This
   * composes the key/value array into a JSON object
   *
   * @param {Array} dataArray - array of events
   */
  _extractData(dataArray) {
    const dataObject = {};
    for (let dataIndex = 0; dataIndex < dataArray.length; dataIndex += 2) {
      dataObject[dataArray[dataIndex]] = dataArray[dataIndex + 1];
    }
    return dataObject;
  }

  /**
   * getEvents -- returns this.events as an array of JSON objects
   *
   * @param {Array} dataArray - array of events
   */
  getEvents() {
    return cloneDeep(this._events);
  }

  /**
   * getStreamName -- returns this.events as an array of JSON objects
   *
   * @param {Array} dataArray - array of events
   */
  getStreamName() {
    return this._streamName;
  }
}

module.exports = EventBatch;
