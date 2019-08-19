const hash = require("object-hash");
const Device = require("./Device");
const Authenticator = require("./Authenticator");

class AuthenticationManager {
    constructor() {
        this.devicesMap = {};
        this.authenticators = {};
    }

    importDevices(devices) {
        for (const rawDevice of devices) {
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
    }

    authenticateMessage(message) {
        for (const key in this.authenticators) {
            const authenticator = this.authenticators[key];
            const res = authenticator.authenticate(message);

            if (res !== false) {
                return res;
            }
        }

        return false;
    }

    getAuthenticator(authentication) {
        const keyPathHash = hash(Object.keys(authentication));

        if (keyPathHash in this.authenticators) {
            return this.authenticators[keyPathHash];
        }

        return null;
    }
}

module.exports = AuthenticationManager;
