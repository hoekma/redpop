const Redis = require('ioredis');
const defaultConfig = require('./config');
const cloneDeep = require('lodash/cloneDeep');

/**
 * Class RedPop -- Top level class from which consumers and pubishers inherit
 *              -- Handles all REDIS setup.
 *              -- RedPop also provides helper logic based on knowing the config
 *              -- context of sub-classes so it inverts some of the order of parameters
 *              -- as compared to ioredis functions that are essentially passthrough to
 *              -- the core Redis commands.
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
    this.setConfig();
  }

  /**
   * setConfig -- Abstract method to do setup configuration (e.g. consumer config)
   * Override in a subclass.
   */

  setConfig() {
    return true;
  }

  /**
   * _initRedis -- Instantiates an ioredis instance.
   */

  _initRedis() {
    const server = this.config.server;
    let connectionObject = {
      ...server.options,
      ...defaultConfig.server.options
    };

    switch (server.connectionType) {
      case 'standalone': {
        connectionObject = {
          ...connectionObject,
          ...server.connection
        };

        if (server.password) {
          connectionObject.password = server.password;
        }

        try {
          this.redis = new Redis(connectionObject);
          console.log(
            `Connected in standalone mode to ${connectionObject.host}`
          );
        } catch (e) {
          this.redis = null;
          console.log(e);
          throw new Error('Unable to create Redis connection.');
        }
        break;
      }
      case 'cluster': {
        if (server.password) {
          connectionObject = {
            ...connectionObject,
            redisOptions: { password: server.password }
          };
        }

        try {
          this.redis = new Redis.Cluster(
            this.config.server.connections,
            connectionObject
          );
          console.log(
            `Connected in cluster mode to ${this.config.server.connections[0].host}`
          );
        } catch (e) {
          this.redis = null;
          throw new Error('Unable to create Redis connection.');
        }
        break;
      }
      default: {
        throw new Error('Redis server type not specificed');
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
   * @param {string} stream Optional stream name parameter.
   *
   */

  async xlen(stream) {
    const streamName = stream || this.config.stream.name;
    return this.redis.xlen(streamName);
  }

  /**
   * xdel -- calls ioredis xlen.
   *
   * @param {string} eventId Event ID To Delete
   * @param {string} stream Optional stream name parameter.
   *
   */

  async xdel(eventId, stream) {
    const streamName = stream || this.config.stream.name;

    return this.redis.xdel(streamName, eventId);
  }

  /**
   * xadd -- adds an event to a redis stream
   *
   * @param {Object} event JSON object with key-value pairs.
   * @param {String} stream Optional stream name parameter
   *
   */

  async xadd(event, stream) {
    const streamName = stream || this.config.stream.name;

    const params = [];
    Object.keys(event).map(key => {
      params.push(key);
      const value = event[key];
      params.push(JSON.stringify(value));
    });

    return this.redis.xadd(streamName, '*', ...params);
  }

  /**
   * xtrim -- calls xgtrim
   * @param {String} params Array of parameters
   */
  async xtrim(maxLength, stream) {
    const streamName = stream || this.config.stream.name;

    return this.redis.xtrim(streamName, 'MAXLEN', maxLength);
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
   * @eventId {String} eventId streamn_id to xack
   * @group {string} (optional) consumer group name
   * @stream {string} (optional) stream name
   */
  async xack(eventId, group, stream) {
    const streamName = stream || this.config.stream.name;
    const groupName = group || this.config.consumer.group;

    return this.redis.xack(streamName, groupName, eventId);
  }

  /**
   * xgroup -- calls xgroup
   * @param {String} params Array of parameters
   */
  async xgroup(...params) {
    return this.redis.xgroup(...params);
  }

  /**
   * xinfo -- calls xinfo
   * @param {String} params Array of parameters
   */
  async xinfo(...params) {
    return this.redis.xinfo(...params);
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
   * @param {Array} eventIds Array of redis stream IDs
   * @param {String} stream (optional) stream name
   * @param {String} group (optional) consumer group name
   * @param {String} consumer (optional) consumer name
   * @param {Integer} timeoutMS (optional) timeout of idle event in MS
   */
  async xclaim(eventIds, stream, group, consumer, timeoutMS) {
    const streamName = stream || this.config.stream.name;
    const groupName = group || this.config.consumer.group;
    const consumerName = consumer || this.config.consumer.name;
    const timeout = timeoutMS || this.config.consumer.pendingEventTimeoutMs;

    return this.redis.xclaim(
      streamName,
      groupName,
      consumerName,
      timeout,
      ...eventIds
    );
  }
}

module.exports = RedPop;
