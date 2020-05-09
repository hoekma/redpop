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
        // How long does the subscriber wait for a batch of events each cycle (default 2 seconds)
        waitTimeMs: 2000
        // How long the subscriber is idle before being recycled from the server pool (default 90 mins)
        idleTimeoutMs: 5400000
        // If a subscriber doesn't process an event fast enough, how long before
        // the event is put back into the pool for reprocessing (default 2 mins)
        eventPendingTimeoutMs: 120000
        // How many events will the subscriber pull from the server each time (default 50)
        batchSize: 50
        // How many times does an event get replayed before the event is discarded (default 3)
        // This will discard an event if it is erroring out repeatedly
        eventMaximumReplays: 3
    }
}
```
