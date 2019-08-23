const amqp = require("amqplib");
const config = require("./config");
const { logger } = require("./logger");
const AuthenticationManager = require("./lib/AuthenticationManager");
const DeviceManager = require("./lib/DeviceManager");

const deviceManager = new DeviceManager();
const authenticationManager = new AuthenticationManager();

deviceManager.on("devicesLoaded", devices => {
    authenticationManager.importDevices(devices);
});

deviceManager.on("deviceAdded", device => {
    authenticationManager.addDevice(device);
});

deviceManager.on("deviceDeleted", device => {
    authenticationManager.deleteDevice(device);
});

deviceManager.on("deviceUpdated", device => {
    authenticationManager.updateDevice(device);
});

amqp.connect(config.amqpAddress)
    .then(conn => {
        deviceManager.setupAmqpListener(conn);

        return conn.createChannel().then(ch => {
            var handleMessage = message => {
                try {
                    var content = message.content.toString("utf-8");
                    var messageData = JSON.parse(content);

                    logger.info(`Attempting to authenticate message ${messageData.uuid}`);

                    var device = authenticationManager.authenticateMessage(
                        messageData.message
                    );

                    if (device !== false) {
                        logger.info(
                            `Message ${messageData.uuid} authenticated.`
                        );

                        messageData.device = device;

                        var json = JSON.stringify(messageData);
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
                            `Message ${messageData.uuid} not authenticated.`
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
