const RedPop = require('../RedPop');
const EventBatch = require('./EventBatch');

class PendingEvents extends RedPop {
  constructor(subscriber) {
    super(subscriber.config);
    this.subscriber = subscriber;
    this.pendingMessges = [];
  }

  async _removeMaxRetries() {
    this._pendingEvents = this._pendingEvents.filter(event => {
      if (event[3] > this.config.consumer.eventMaximumReplays) {
        // xack the event if it is past replays because there is
        // an error condition causing it to fail.
        this.subscriber.xack(event[1]);
        return false;
      } else {
        return true;
      }
    });
  }

  async _replayIdleEvents() {
    if (this._pendingEvents.length > 0) {
      const eventsToReplay = await this.xclaim(this._pendingEvents);
      const eventBatch = new EventBatch(eventsToReplay);
      this.subscriber._processEvents(eventBatch);
    }
  }

  async processPendingEvents() {
    // Retrieve pending events
    this._pendingEvents = await this.xpending();
    console.log(this.pendingEvents);
    // Discard pendingEvents that have been retried too many times
    await this._removeMaxRetries();

    // Get a batch of events that were claimed by a subscriber
    // but that were never xack'd

    await this._replayIdleEvents();
  }
}

module.exports = PendingEvents;
