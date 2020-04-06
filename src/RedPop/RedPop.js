const Redis = require('ioredis');
const defaultConfig = require('./config');
const cloneDeep = require('lodash/cloneDeep');

/**
 * Class RedPop -- Top level class from which subscribers and pubishers inherit
 *              -- Handles all REDIS setup
 */

class RedPop {
  constructor(config) {
    this._setConfig(config);
    this._initRedis();
  }

  /**
   * _setConfig -- ensures that the configuration is valid. Defaults to
   *           -- a standalone local redis server on port 6379
   *
   * TODO: Add security & Encryption options
   *
   * @param {Object} config Object with configuration
   */

  _setConfig(config) {
    this.config = config || cloneDeep(defaultConfig);
    if (config && config.server) {
      this.config.server.address = config.server.address
        ? config.server.address
        : this.config.server.address;

      this.config.server.port = config.server.port
        ? config.server.port
        : this.config.server.port;

      this.config.server.type = config.server.type
        ? config.server.type
        : this.config.server.type;
    }

    if (config && config.stream) {
      this.config.stream.name = config.stream.name
        ? config.stream.name
        : this.config.stream.name;
    }

    this.setConfig();
  }

  /**
   * setConfig -- Abstract method to do setup configuration (e.g. subscriber config)
   * Override in a subclass.
   */

  setConfig() {
    return true;
  }

  /**
   * _initRedis -- Instantiates an ioredis instance.
   */

  _initRedis() {
    switch (this.config.server.type) {
      case 'cluster': {
        break;
      }
      default: {
        const connectionParameters = {
          port: this.config.server.port,
          host: this.config.server.address
        };

        try {
          this.redis = new Redis(connectionParameters);
        } catch (e) {
          this.redis = null;
          throw new Error('Unable to create Redis connection.');
        }
        break;
      }
    }
  }

  /**
   * disconnectRedis -- releases Redis connection
   */
  disconnectRedis() {
    return this.redis.disconnect();
  }

  /**
   * xlen -- calls ioredis xlen.
   *
   * @param {string} pStreamName Optional stream name parameter.
   *
   */

  async xlen(pStreamName) {
    const streamName = pStreamName || this.config.stream.name;
    return this.redis.xlen(streamName);
  }

  /**
   * xdel -- calls ioredis xlen.
   *
   * @param {string} messageId Message ID To Delete
   * @param {string} pStreamName Optional stream name parameter.
   *
   */

  async xdel(messageId, pStreamName) {
    const streamName = pStreamName || this.config.stream.name;

    return this.redis.xdel(streamName, messageId);
  }

  /**
   * xadd -- adds a message to a redis stream
   *
   * @param {Object} message JSON object with key-value pairs.
   * @param {String} pStreamName Optional stream name parameter
   *
   */

  async xadd(message, pStreamName) {
    const streamName = pStreamName || this.config.stream.name;

    const params = [];
    Object.keys(message).map(key => {
      params.push(key);
      const value = message[key];
      params.push(JSON.stringify(value));
    });

    return this.redis.xadd(streamName, '*', ...params);
  }

  /**
   * xreadgroup -- calls xreadgroup
   * @param {Object} params  JSON object with xreadgroup parameters
   */
  async xreadgroup(...params) {
    return this.redis.xreadgroup(...params);
  }

  /**
   * xack -- calls xack
   * @param {String} params Array of parameters
   */
  async xack(...params) {
    return this.redis.xack(...params);
  }

  /**
   * xgroup -- calls xgroup
   * @param {String} params Array of parameters
   */
  async xgroup(...params) {
    return this.redis.xgroup(...params);
  }

  /**
   * xpending -- calls xpending
   * @param {String} params Array of parameters
   */
  async xpending() {
    return this.redis.xpending(
      this.config.stream.name,
      this.config.consumer.group,
      '-',
      '+',
      this.config.consumer.batchSize
    );
  }

  /**
   * xclaim -- calls xpending
   * @param {String} params Array of parameters
   */
  async xclaim(...messageIds) {
    return this.redis.xclaim(
      this.config.stream.name,
      this.config.consumer.group,
      this.config.consumer.name,
      this.config.consumer.idleTimeoutMessageMs,
      ...messageIds
    );
  }
}

module.exports = RedPop;
