const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    amqpAddress: process.env.AMQP_ADDRESS,
    noAuthRawMessageQ: process.env.NO_AUTH_RAW_MESSAGE_Q,
    exchangeName: process.env.EXCHANGE_NAME,
    hasAuthRawMessageQ: process.env.HAS_AUTH_RAW_MESSAGE_Q,
    oopCoreDeviceEndpoint: process.env.OOP_CORE_DEVICE_ENDPOINT,
    oopCoreDeviceUpdateExchange: process.env.OOP_CORE_DEVICE_UPDATE_EXCHANGE
};
