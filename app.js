const amqp = require("amqplib");
const config = require("./config");
const { logger } = require("./logger");
const Authenticator = require("./lib/Authenticator");
const data = require("./fake-device-data");

Authenticator.importDevices(data);

amqp.connect(config.amqpAddress)
    .then(conn => {
        return conn.createChannel().then(ch => {
            var handleMessage = message => {
                try {
                    var content = message.content.toString("utf-8");
                    var messageData = JSON.parse(content);

                    logger.info(`Message originated from ${messageData.ip}.`);

                    var device = Authenticator.authenticateMessage(messageData);

                    if (device !== false) {
                        logger.info(
                            `Message originated from ${messageData.ip} authenticated.`
                        );

                        var toSend = {
                            device: device,
                            message: messageData
                        };

                        var json = JSON.stringify(toSend);
                        if (
                            ch.publish(
                                config.exchangeName,
                                config.hasAuthRawMessageQ,
                                Buffer.from(json)
                            )
                        ) {
                            ch.ack(message);
                        } else {
                            throw new Error(
                                "Unable to publish to authenticated queue."
                            );
                        }
                    } else {
                        ch.ack(message);

                        logger.info(
                            `Message originated from ${messageData.ip} not authenticated.`
                        );
                    }
                } catch (e) {
                    ch.nack(message);

                    logger.error(String(e));
                }
            };

            return ch.consume(config.noAuthRawMessageQ, handleMessage);
        });
    })
    .catch(logger.error);

