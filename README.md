# redpop

Ready-Made Redis Streams Subscriber and Publisher

# configuration for pubisher {default}

```javascript
{
    server: {
        // URI of the Redis server (default localhost)
        address: 'localhost',
        // TCP port the Redis server is listening on (default 6370)
        port: 6370,
        // Redis connection type -- standalone or cluster (default standalone)
        connectionType: 'standalone',
    },
    stream: {
        // name of the stream or 'topic' (default redpop)
        name: 'redpop',
    },
}
```

#configuration for subscriber

```javascript
{
     server: {
        // URI of the Redis server (default localhost)
        // Do NOT include protocol like REDIS://localhost or REDIS://somedomain.amazonaws.com
        address: 'localhost',
        // TCP port the Redis server is listening on (default 6370)
        port: 6370,
        // Redis connection type -- standalone or cluster (default standalone)
        connectionType: 'standalone',
    },
    stream: {
        // name of the stream or 'topic' (default redpop)
        name: 'redpop',
    },
    consumer: {
        // Consumer group pool that takes the same action
        group: 'redpop_consumer'
        // Unique name of the subscriber instance
        name: 'redpop_consumer_uuid'
        // How long does the subscriber wait for a batch of messages each cycle (default 2 seconds)
        waitTimeMs: 2000
        // How long the subscriber is idle before being recycled from the server pool (default 90 mins)
        idleTimeoutMs: 5400000
        // If a subscriber doesn't process a message fast enough, how long before
        // the message is put back into the pool for reprocessing (default 2 mins)
        messagePendingTimeoutMs: 120000
        // How many messages will the subscriber pull from the server each time (default 50)
        messageBatchSize: 50
        // How many times does a message get replayed before the message is discarded (default 3)
        // This will discard a message if it is erroring out repeatedly
        messageMaximumReplays: 3
    }
}
```
