const fetch = require("node-fetch");
const EventEmitter = require("events");

class DeviceManager extends EventEmitter {
    constructor(broker, config, logger) {
        super();

        this.broker = broker;
        this.config = config;
        this.logger = logger;

        this.devices = fetch(`${config.oopCoreApiUrl}/devices/auth`, {
            headers: { "X-Core-Token": config.oopCoreToken }
        }).then(res => res.json());

        this.devices.then(json => {
            this.emit("devicesLoaded", json);
        });

        this.broker.subscribe(
            config.oopCoreDeviceUpdateExchange,
            this.handleDeviceMessage.bind(this)
        );
    }

    handleDeviceMessage(message) {
        const data = message.content;

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
                this.logger.error(`Unknown device action "${data.action}".`);
        }
    }
}

module.exports = DeviceManager;
