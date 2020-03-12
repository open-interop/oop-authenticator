const hash = require("object-hash");
const Device = require("./Device");
const Authenticator = require("./Authenticator");

class AuthenticationManager {
    constructor(logger) {
        this.logger = logger;
        this.devicesMap = {};
        this.authenticators = {};
        this.loaded = new Promise(resolve => {this.resolver = resolve;});
    }

    importDevices(devices) {
        this.resolver();

        for (const rawDevice of devices) {
            this.addDevice(rawDevice);
        }
    }

    addDevice(rawDevice) {
        if (rawDevice.id in this.devicesMap) {
            this.logger.error(
                `Attempted to add device "${rawDevice.id}" but it already exists.`
            );
            return;
        }

        const device = new Device(rawDevice);

        this.devicesMap[rawDevice.id] = device;

        let authenticator;

        const keyPathHash = hash(device.getKeyPath());

        if (keyPathHash in this.authenticators) {
            authenticator = this.authenticators[keyPathHash];
        } else {
            authenticator = new Authenticator(device.getKeyPath());
            this.authenticators[keyPathHash] = authenticator;
        }

        authenticator.addDevice(device);
    }

    deleteDevice(rawDevice) {
        const device = this.devicesMap[rawDevice.id];

        if (!device) {
            this.logger.error(
                `Unable to delete device "${rawDevice.id}" as it doesn't exist.`
            );
            return;
        }

        const keyPathHash = hash(device.getKeyPath());
        const authenticator = this.authenticators[keyPathHash];

        authenticator.deleteDevice(device);
        delete this.devicesMap[rawDevice.id];
    }

    updateDevice(device) {
        this.deleteDevice(device);
        this.addDevice(device);
    }

    async authenticateMessage(message) {
        await this.loaded;

        for (const key in this.authenticators) {
            const authenticator = this.authenticators[key];
            const res = authenticator.authenticate(message);

            if (res !== false) {
                return res;
            }
        }

        return false;
    }
}

module.exports = AuthenticationManager;
