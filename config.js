const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    amqpAddress: process.env.OOP_AMQP_ADDRESS,
    exchangeName: process.env.OOP_EXCHANGE_NAME,
    oopCoreToken: process.env.OOP_CORE_TOKEN,

    authenticatorInputQ: process.env.OOP_AUTHENTICATOR_INPUT_Q,
    authenticatorOutputQ: process.env.OOP_AUTHENTICATOR_OUTPUT_Q,

    oopCoreDeviceUpdateExchange: process.env.OOP_CORE_DEVICE_UPDATE_EXCHANGE,
    oopCoreApiUrl: process.env.OOP_CORE_API_URL
};
