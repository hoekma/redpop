This folder conatins the programs that run the package.json demo scripts and can be used for smoke testing the app. They are also good exmaple files for someone starting a new subclass of Consumer or integrating the Publisher into an application.

Files:

./config -- generic config

Directories

./publisher -- demo publisher
./consumer -- demo consumer with its own config
./replay -- will replay all events published so far in the redis stream

Usage:

From the root of the project

npm run demoConsumer will run ./consumer/consumer.js and starts a consumer
npm run demoPublisher will run the ./demoPublisher/publisher.js
npm run demoReplay will run ./replay/replay.js

Recommended Process:

Start Redis

1. Open a shell window in the RedPop root directory
2. docker-compose up -d

Start the consumer

1. Open a shell window in the RedPop root directory
2. npm run demoConsumer
3. Once the consumer is running, you will see "dots" play on the screen to indicate that the consumer is listening.

Run the publisher

1. Open a second shell window in the RedPop root directory
2. Ensure both windows are visible
3. npm run demoPublisher

Observe events play in the consumer window.

Repeat the publisher several times.

To replay all events

1. In the publisher shell window or a new shell
2. npm run demoReplay

All of the events in the Redis stream will replay and the results can be observed in the consumer window.

Things to try:

1. Edit the publisher file to publish more events.
2. Edit the consumer's config to play with the batch size

Note: the consumer should be run in its own window as it continually listens for events.  
Be sure to open a separate window to run the publisher and replay,
