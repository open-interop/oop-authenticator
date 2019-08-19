const hash = require("object-hash");
const Device = require("./Device");

class Authenticator {
    static importDevices(devices) {
        for (const rawDevice of devices) {
            const device = new Device(rawDevice);
            Authenticator.devicesMap[rawDevice.id] = device;

            let authenticator;

            const keyPathHash = hash(device.getKeyPath());

            if (keyPathHash in Authenticator.authenticators) {
                authenticator = Authenticator.authenticators[keyPathHash];
            } else {
                authenticator = new Authenticator(device.getKeyPath());
                Authenticator.authenticators[keyPathHash] = authenticator;
            }

            authenticator.addDevice(device);
        }
    }

    static authenticateMessage(message) {
        for (const key in Authenticator.authenticators) {
            const authenticator = Authenticator.authenticators[key];
            const res = authenticator.authenticate(message);

            if (res !== false) {
                return res;
            }
        }

        return false;
    }

    static getAuthenticator(authentication) {
        const keyPathHash = hash(Object.keys(authentication));

        if (keyPathHash in Authenticator.authenticators) {
            return Authenticator.authenticators[keyPathHash];
        }

        return null;
    }

    constructor(keys) {
        this.keys = keys;
        this.authenticationMap = {};
    }

    addDevice(device) {
        const authenticationHash = this.valueHash(device.getAuthentication());
        this.authenticationMap[authenticationHash] = device;
    }

    authenticate(message) {
        const values = this.getKeyValues(message);

        if (values === false) {
            return false;
        }

        const key = this.valueHash(values);

        if (key in this.authenticationMap) {
            return this.authenticationMap[key].device;
        }

        return false;
    }

    valueHash(values) {
        return hash(values, { algorithm: "sha256" });
    }

    /**
     * Extracts values into an object based on an array of key paths.
     * Eg:
     * `["a.b", "c"] => {"a.b": message.a.b, "c": message.c}`
     *
     * @param message the message object.
     *
     * @return The extracted values in an object.
     */
    getKeyValues(message) {
        var ret = {};

        for (const k of this.keys) {
            const parts = k.split(".");

            let o = message;
            for (const part of parts) {
                if (!(o && typeof o === "object" && part in o)) {
                    return false;
                }

                o = o[part];
            }

            ret[k] = o;
        }

        return ret;
    }
}

module.exports = Authenticator;
