const RedPop = require('../../RedPop');
const EventBatch = require('../EventBatch/EventBatch');
const isEmpty = require('lodash/isEmpty');

// Array element numbers to make the redis responses easier to understand
const EVENT_ID = 0;
// const EVENT_CONSUMER = 1;
// const EVENT_TIMEPENDING = 2;
const EVENT_REPLAY_COUNT = 3;

// PendingEvents will search for events on the Redis stream
// that were assigned to a subscriber, but never XACKs as complete.
// This can happen if a subscriber is shut down while processing a batch
// of events, the subscriber crashes and never XACKS
// the event.  The subscriber settings define how long before it is assumed
// that the event should be replayed as well as how many times to replay
// the event before deleteing the mssage from the bus (i.e. the event will
// never successuflly run so stop retrying)

class PendingEvents extends RedPop {
  constructor(subscriber) {
    super(subscriber.config);
    this.subscriber = subscriber;
    this.pendingMessges = [];
  }

  async _removeMaxRetries() {
    // Removes messages that have been retried too many times by
    // XACK'ing them.  They remain in the stream.
    this._pendingEvents = this._pendingEvents.filter(event => {
      if (
        event[EVENT_REPLAY_COUNT] > this.config.consumer.eventMaximumReplays
      ) {
        // xack the event if it is past replays because there is
        // an error condition causing it to fail.
        this.subscriber.xack(event[EVENT_ID]);
        return false;
      } else {
        return true;
      }
    });
  }

  async _replayIdleEvents() {
    // The subscriber will claim the messages and attempt
    // to replay them as if they were a new batch that came in.
    if (this._pendingEvents.length > 0) {
      const pendingEventIds = this._pendingEvents.reduce((eventIds, event) => {
        eventIds.push(event[0]);
        return eventIds;
      }, []);

      const eventsToReplay = await this.xclaim(pendingEventIds);

      if (!isEmpty(eventsToReplay)) {
        // This will rebuild the list of messages into an equivalent
        // format as XREAD produces to create an EventBatch instance
        //
        const xreadFormat = [[this.config.stream.name, eventsToReplay]];
        const eventBatch = new EventBatch(xreadFormat);
        this.subscriber._processEvents(eventBatch);
      }
    }
  }

  async processPendingEvents() {
    // Retrieve pending events
    // Discard pendingEvents that have been retried config.eventMaximumReplays

    this._pendingEvents = await this.xpending();
    await this._removeMaxRetries();

    // Replay events that were claimed by a subscriber
    // but that were not xack'd before config.eventPendingTimeoutMs

    await this._replayIdleEvents();
  }
}

module.exports = PendingEvents;
