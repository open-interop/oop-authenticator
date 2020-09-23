const fetch = require("node-fetch");
const EventEmitter = require("events");

const MAX_RETRIES = 10;

class DeviceManager extends EventEmitter {
    constructor(broker, config, logger) {
        super();

        this.broker = broker;
        this.config = config;
        this.logger = logger;

        this.devices = this.getDevices();

        this.devices.then(json => {
            this.emit("devicesLoaded", json);
        });

        this.broker.subscribe(
            config.oopCoreDeviceUpdateExchange,
            this.handleDeviceMessage.bind(this)
        );
    }

    async getDevices(retries = 0) {
        if (retries >= MAX_RETRIES) {
            throw new Error(
                "Max retries reached, unable to fetch devices from core."
            );
        }

        try {
            const res = await fetch(
                `${this.config.oopCoreApiUrl}/devices/auth`,
                {
                    headers: { "X-Core-Token": this.config.oopCoreToken }
                }
            );

            if (res.status < 200 || res.status > 299) {
                throw new Error(
                    `Result status "${res.status}" outside 200 range.`
                );
            }

            const data = await res.json();

            if (!(data instanceof Array)) {
                throw new Error(
                    `Got data type "${typeof data}", which is not iterable.`
                );
            }

            return data;
        } catch (e) {
            this.logger.error(e);

            await new Promise(resolve => setTimeout(resolve, 12000));

            return this.getDevices(retries + 1);
        }
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
