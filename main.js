const AuthenticationManager = require("./lib/AuthenticationManager");
const DeviceManager = require("./lib/DeviceManager");

module.exports = (broker, config, logger) => {
    const deviceManager = new DeviceManager(broker, config, logger);
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

    broker.consume(config.authenticatorInputQ, message => {
        var messageData = message.content;

        logger.info(`Attempting to authenticate message ${messageData.uuid}`);

        var device = authenticationManager.authenticateMessage(
            messageData.message
        );

        if (device !== false) {
            logger.info(
                `Message ${messageData.uuid} authenticated.`
            );

            messageData.device = device;

            return broker.publish(
                config.exchangeName,
                config.authenticatorOutputQ,
                messageData
            );
        } else {
            logger.info(
                `Message ${messageData.uuid} not authenticated.`
            );
        }
    });
};
