import test from "ava";
var AuthenticationManager = require("./AuthenticationManager");

const logger = { info: () => {}, error: () => {} };

test("Cannot add same device twice", t => {
    const auth = new AuthenticationManager(logger);

    t.plan(1);

    auth.importDevices([
        { authentication: { foo: "bar" }, id: 1 },
        { authentication: { foo: "bar" }, id: 2 },
        { authentication: { foo: "bar" }, id: 3 }
    ]);

    t.is(Object.keys(auth.authenticators).length, 1);
});

test("Same key path only creates one authenticator", t => {
    const auth = new AuthenticationManager();

    t.plan(1);

    auth.importDevices([
        { id: 1, authentication: { bar: "bar" } },
        { id: 2, authentication: { bar: "bim" } },
        { id: 3, authentication: { bar: "baz" } },
        { id: 4, authentication: { "foo.bar": "bar", "bar.baz": "fizz" } },
        { id: 5, authentication: { "foo.bar": "bim", "bar.baz": "buzz" } },
        { id: 6, authentication: { "foo.bar": "baz", "bar.baz": "fizzbuzz" } }
    ]);

    t.is(Object.keys(auth.authenticators).length, 2);
});

test("authenticates matching key", async t => {
    const auth = new AuthenticationManager(logger);

    t.plan(1);

    auth.importDevices([
        { authentication: { foo: "bar" }, id: 1 },
        { authentication: { foo: "bim" }, id: 2 },
        { authentication: { foo: "baz" }, id: 3 }
    ]);

    var device = await auth.authenticateMessage({ foo: "bim" });

    t.is(device.id, 2);
});

test("doesn't authenticate mismatching key", async t => {
    const auth = new AuthenticationManager();

    t.plan(1);

    auth.importDevices([
        { authentication: { foo: "bar" }, id: 1 },
        { authentication: { foo: "bim" }, id: 2 },
        { authentication: { foo: "baz" }, id: 3 }
    ]);

    var result = await auth.authenticateMessage({ foo: "nope" });

    t.false(result);
});

test("authenticates matching compound key", async t => {
    const auth = new AuthenticationManager(logger);

    t.plan(1);

    auth.importDevices([
        {
            authentication: { "a.b.c": "bar", "a.b.d": "bim", e: "baz" },
            id: 1
        }
    ]);

    var result = await auth.authenticateMessage({
        a: { b: { c: "bar", d: "bim" } },
        e: "baz"
    });

    t.is(result.id, 1);
});

test("doesn't authenticate mismatching compound key", async t => {
    const auth = new AuthenticationManager(logger);

    t.plan(1);

    auth.importDevices([
        {
            authentication: { "a.b.c": "bar", "a.b.d": "bim", e: "baz" },
            id: 1
        }
    ]);

    var result = await auth.authenticateMessage({
        a: { b: { c: "bar", d: "nope" } },
        e: "baz"
    });

    t.false(result);
});

test("authenticats from set", async t => {
    const auth = new AuthenticationManager();

    t.plan(1);

    auth.importDevices([
        { authentication: { foo: "bar" }, id: 1 },
        { authentication: { foo: "bim" }, id: 2 },
        { authentication: { foo: "baz" }, id: 3 }
    ]);

    var result = await auth.authenticateMessage({ foo: "bim" });

    t.is(result.id, 2);
});

test("add device doesn't duplicate IDs", async t => {
    const auth = new AuthenticationManager(logger);

    t.plan(2);

    auth.importDevices([]);

    auth.addDevice({ authentication: { foo: "bar" }, id: 1 });
    auth.addDevice({ authentication: { foo: "notbar" }, id: 1 });

    var result = await auth.authenticateMessage({ foo: "bar" });

    t.is(result.id, 1);

    result = await auth.authenticateMessage({ foo: "notbar" });

    t.false(result);
});

test("delete device", async t => {
    const auth = new AuthenticationManager(logger);

    t.plan(2);

    auth.importDevices([]);

    auth.addDevice({ authentication: { foo: "bar" }, id: 1 });

    var result = await auth.authenticateMessage({ foo: "bar" });

    t.is(result.id, 1);
    auth.deleteDevice({ authentication: { foo: "bar" }, id: 1 });

    result = await auth.authenticateMessage({ foo: "bar" });

    t.false(result);
});

test("delete device on non existent device doesn't fail", t => {
    const auth = new AuthenticationManager(logger);

    t.plan(0);

    auth.importDevices([]);

    auth.addDevice({ authentication: { foo: "bar" }, id: 1 });

    auth.deleteDevice({ authentication: { foo: "bar" }, id: 1 });
    auth.deleteDevice({ authentication: { foo: "bar" }, id: 1 });
    auth.deleteDevice({ authentication: { foo: "bar" }, id: 1 });
});

test("update device", async t => {
    const auth = new AuthenticationManager(logger);

    t.plan(2);

    auth.importDevices([]);

    auth.addDevice({ authentication: { foo: "bar" }, id: 1 });

    var result = await auth.authenticateMessage({ foo: "bar" });

    t.is(result.id, 1);

    auth.updateDevice({ authentication: { foo: "baz" }, id: 1 });

    result = await auth.authenticateMessage({ foo: "baz" });

    t.is(result.id, 1);
});
