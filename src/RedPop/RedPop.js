const Redis = require('ioredis');
const defaultConfig = require('./config');
const cloneDeep = require('lodash/cloneDeep');

/**
 * Class RedPop -- Top level class from which subscribers and pubishers inherit
 *              -- Handles all REDIS setup
 */

class RedPop {
  constructor(config) {
    this.setConfig(config);
    this.initRedis();
  }

  /**
   * setConfig -- ensures that the configuration is valid. Defaults to
   *           -- a standalone local redis server on port 6379
   *
   * TODO: Add security & Encryption options
   *
   * @param {Object} config Object with configuration
   */

  setConfig = config => {
    this.config = cloneDeep(defaultConfig);
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
  };

  /**
   * initRedis -- Instantiates an ioredis instance.
   */

  initRedis = () => {
    switch (this.config.server.type) {
      case 'cluster': {
        console.log('cluster mode');
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
        console.log('standalone mode');
        break;
      }
    }
  };

  /**
   * xlen -- calls ioredis xlen.
   *
   * @param {string} pStreamName Optional stream name parameter.
   *
   */

  xlen = async pStreamName => {
    const streamName = pStreamName || this.config.stream.name;

    return this.redis.xlen(streamName);
  };

  /**
   * xdel -- calls ioredis xlen.
   *
   * @param {string} messageId Message ID To Delete
   * @param {string} pStreamName Optional stream name parameter.
   *
   */

  xdel = async (messageId, pStreamName) => {
    const streamName = pStreamName || this.config.stream.name;

    return this.redis.xdel(streamName, messageId);
  };

  /**
   * xadd -- adds a message to a redis stream
   *
   * @param {Object} message JSON object with key-value pairs.
   * @param {String} pStreamName Optional stream name parameter
   *
   */

  xadd = async (message, pStreamName) => {
    const streamName = pStreamName || this.config.stream.name;

    let params = [];
    Object.keys(message).map(key => {
      params.push(key);
      const value = message[key];
      switch (typeof value) {
        case 'object': {
          params.push(JSON.stringify(value));
          break;
        }
        default: {
          params.push(String(value));
        }
      }
    });

    const messageId = await this.redis.xadd(
      this.config.stream.name,
      '*',
      ...params
    );
    console.log(messageId);
    return messageId;
  };
}

module.exports = RedPop;
