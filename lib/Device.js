class Device {
    constructor(device) {
        this.setDevice(device);
    }

    setDevice(device) {
        this.device = device;
        this.authentication = device.authentication;
    }

    getKeyPath() {
        return Object.keys(this.authentication);
    }

    getAuthentication() {
        return this.authentication;
    }
}

module.exports = Device;
