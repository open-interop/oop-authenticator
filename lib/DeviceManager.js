const fetch = require("node-fetch");
const EventEmitter = require("events");
const config = require("../config");
const { logger } = require("../logger");

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
                    this.handleDeviceMessage.bind(this)
                );
            });
    }

    handleDeviceMessage(message) {
        const content = message.content.toString("utf8");
        const data = JSON.parse(content);

        if (!("device" in data && "action" in data)) {
            return;
        }

        switch (data.action) {
            case "add":
                this.emit("deviceAdded", data.device);
                break;

            case "update":
                this.emit("deviceUpdated", data.device);
                break;

            case "delete":
                this.emit("deviceDeleted", data.device);
                break;

            default:
                logger.error(`Unknown device action "${data.action}".`);
        }
    }
}

module.exports = DeviceManager;
