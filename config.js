const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    amqpAddress: process.env.OOP_AMQP_ADDRESS,
    exchangeName: process.env.OOP_EXCHANGE_NAME,
    oopCoreToken: process.env.OOP_CORE_TOKEN,
    noAuthRawMessageQ: process.env.OOP_NOAUTH_RAW_MESSAGE_Q,
    hasAuthRawMessageQ: process.env.OOP_HASAUTH_RAW_MESSAGE_Q,
    oopCoreDeviceEndpoint: process.env.OOP_CORE_DEVICE_ENDPOINT,
    oopCoreDeviceUpdateExchange: process.env.OOP_CORE_DEVICE_UPDATE_EXCHANGE,
    oopCoreApiUrl: process.env.OOP_CORE_API_URL
};
