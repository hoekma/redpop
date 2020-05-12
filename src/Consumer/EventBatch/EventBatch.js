const cloneDeep = require('lodash/cloneDeep');
const BATCH_STREAM_NAME = 0;
const BATCH_EVENTS = 1;
const EVENT_ID = 0;
const EVENT_PAYLOAD = 1;

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
    this._streamName = eventBatch[BATCH_STREAM_NAME];
    this._events = eventBatch[BATCH_EVENTS].map(event => ({
      id: event[EVENT_ID],
      data: this._extractData(event[EVENT_PAYLOAD])
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
   * getStreamName -- returns the stream name of the batch
   *
   */
  getStreamName() {
    return this._streamName;
  }
}

module.exports = EventBatch;
