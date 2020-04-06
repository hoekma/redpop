const RedPop = require('../RedPop');
const MessageBatch = require('./MessageBatch');

class PendingMessages extends RedPop {
  constructor(subscriber) {
    super(subscriber.config);
    this.subscriber = subscriber;
    this.pendingMessges = [];
  }

  async _removeMaxRetries() {
    this._pendingMessages = this._pendingMessages.filter(message => {
      if (message[3] > this.config.consumer.messageMaximumReplays) {
        // xack the message if it is past replays because there is
        // an error condition causing it to fail.
        this.subscriber.xack(message[1]);
        return false;
      } else {
        return true;
      }
    });
  }

  async _replayIdleMessages() {
    if (this._pendingMessages.length > 0) {
      const messagesToReplay = await this.xclaim(this._pendingMessages);
      const messageBatch = new MessageBatch(messagesToReplay);
      this.subscriber._processMessages(messageBatch);
    }
  }

  async processPendingMessages() {
    // Retrieve pending messages
    this._pendingMessages = await this.xpending();
    console.log(this.pendingMessages);
    // Discard pendingMessages that have been retried too many times
    await this._removeMaxRetries();

    // Get a batch of messages that were claimed by a subscriber
    // but that were never xack'd

    await this._replayIdleMessages();
  }
}

module.exports = PendingMessages;
