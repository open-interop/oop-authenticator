const fetch = require("node-fetch");
const EventEmitter = require("events");
const config = require("../config");

class DeviceManager extends EventEmitter {
    constructor() {
        super();

        this.devices = fetch(config.oopCoreDeviceEndpoint).then(res =>
            res.json()
        );

        this.devices.then(json => {
            this.emit("devicesLoaded", json);
        });
    }

    setupAmqpListener(conn) {
        conn.createChannel()
            .then(ch => {
                this.channel = ch;
                return this.channel.assertQueue("", { exclusive: true });
            })
            .then(queue => {
                this.queue = queue;
                return this.channel.bindQueue(
                    queue.queue,
                    config.oopCoreDeviceUpdateExchange,
                    ""
                );
            })
            .then(() => {
                this.channel.consume(
                    this.queue.queue,
                    this.handleDeviceMessage
                );
            });
    }

    handleDeviceMessage(message) {}
}

module.exports = DeviceManager;
