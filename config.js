const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    amqpAddress: process.env.AMQP_ADDRESS,
    noAuthRawMessageQ: process.env.NO_AUTH_RAW_MESSAGE_Q,
};
