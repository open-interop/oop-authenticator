const amqp = require("amqplib");
const { amqpAddress, noAuthRawMessageQ } = require("./config");
const { logger } = require("./logger");

amqp.connect(amqpAddress)
    .then(function(conn) {
        return conn.createChannel().then(ch => {
            var handleMessage = m => {
                logger.info(m.content.toString("utf-8"));
                ch.ack(m);
            };

            return ch.consume(noAuthRawMessageQ, handleMessage);
        });
    })
    .catch(console.warn);
