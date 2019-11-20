const hash = require("object-hash");

class Authenticator {
    constructor(keys) {
        this.keys = keys;
        this.authenticationMap = {};
    }

    addDevice(device) {
        const authenticationHash = this.valueHash(device.getAuthentication());
        this.authenticationMap[authenticationHash] = device;
    }

    deleteDevice(device) {
        const authenticationHash = this.valueHash(device.getAuthentication());
        delete this.authenticationMap[authenticationHash];
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
