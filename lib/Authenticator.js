const hash = require("object-hash");

class Authenticator {
    static addDevice(device) {
        var keys = Object.keys(device.authentication);
        var keyPath = Authenticator.getKeyPath(device.authentication);
        var authenticator;

        if (keyPath in Authenticator.authenticators) {
            authenticator = Authenticator.authenticators[keyPath];
        } else {
            authenticator = new Authenticator(keys);
            Authenticator.authenticators[keyPath] = authenticator;
        }

        authenticator.addDeviceToValueSet(device);
    }

    static getKeyPath(authentication) {
        return hash.keys(authentication);
    }

    static hashKeyValues(keyValues) {
        return hash(keyValues, { algorithm: "sha256" });
    }

    static getAuthenticator(authentication) {
        return Authenticator.authenticators[
            Authenticator.getKeyPath(authentication)
        ];
    }

    constructor(keys) {
        this.keys = keys;
        this.valueSet = {};
    }

    addDeviceToValueSet(device) {
        var hashKey = Authenticator.hashKeyValues(device.authentication);
        this.valueSet[hashKey] = device;
    }

    authenticate(message) {
        var values = this.getKeyValues(message);
        if (values === false) {
            return false;
        }

        var key = Authenticator.hashKeyValues(values);

        if (key in this.valueSet) {
            return this.valueSet[key];
        }

        return false;
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
                if (!(o && part in o)) {
                    return false;
                }

                o = o[part];
            }

            ret[k] = o;
        }

        return ret;
    }
}

Authenticator.authenticators = {};

module.exports = Authenticator;
