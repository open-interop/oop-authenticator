const oop = require("oop-node-common");

module.exports = new oop.Config({
    amqpAddress: "OOP_AMQP_ADDRESS",
    exchangeName: "OOP_EXCHANGE_NAME",
    oopCoreToken: "OOP_CORE_TOKEN",

    authenticatorInputQ: "OOP_AUTHENTICATOR_INPUT_Q",
    authenticatorOutputQ: "OOP_AUTHENTICATOR_OUTPUT_Q",

    oopCoreDeviceUpdateExchange: "OOP_CORE_DEVICE_UPDATE_EXCHANGE",
    oopCoreApiUrl: "OOP_CORE_API_URL"
});
