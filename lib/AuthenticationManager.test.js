import test from "ava";
var AuthenticationManager = require("./AuthenticationManager");

test("Cannot add same device twice", t => {
    const auth = new AuthenticationManager();

    t.plan(1);

    auth.importDevices([
        { authentication: { foo: "bar" }, id: 1 },
        { authentication: { foo: "bar" }, id: 1 },
        { authentication: { foo: "bar" }, id: 1 }
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

test("authenticates matching key", t => {
    const auth = new AuthenticationManager();

    t.plan(1);

    auth.importDevices([
        { authentication: { foo: "bar" }, id: 1 },
        { authentication: { foo: "bim" }, id: 2 },
        { authentication: { foo: "baz" }, id: 3 }
    ]);

    var device = auth.authenticateMessage({ foo: "bim" });

    t.is(device.id, 2);
});

test("doesn't authenticate mismatching key", t => {
    const auth = new AuthenticationManager();

    t.plan(1);

    auth.importDevices([
        { authentication: { foo: "bar" }, id: 1 },
        { authentication: { foo: "bim" }, id: 2 },
        { authentication: { foo: "baz" }, id: 3 }
    ]);

    var result = auth.authenticateMessage({ foo: "nope" });

    t.false(result);
});

test("authenticates matching compound key", t => {
    const auth = new AuthenticationManager();

    t.plan(1);

    auth.importDevices([
        {
            authentication: { "a.b.c": "bar", "a.b.d": "bim", e: "baz" },
            id: 1
        }
    ]);

    var result = auth.authenticateMessage({
        a: { b: { c: "bar", d: "bim" } },
        e: "baz"
    });

    t.is(result.id, 1);
});

test("doesn't authenticate mismatching compound key", t => {
    const auth = new AuthenticationManager();

    t.plan(1);

    auth.importDevices([
        {
            authentication: { "a.b.c": "bar", "a.b.d": "bim", e: "baz" },
            id: 1
        }
    ]);

    var result = auth.authenticateMessage({
        a: { b: { c: "bar", d: "nope" } },
        e: "baz"
    });

    t.false(result);
});

test("authenticats from set", t => {
    const auth = new AuthenticationManager();

    t.plan(1);

    auth.importDevices([
        { authentication: { foo: "bar" }, id: 1 },
        { authentication: { foo: "bim" }, id: 2 },
        { authentication: { foo: "baz" }, id: 3 }
    ]);

    var result = auth.authenticateMessage({ foo: "bim" });

    t.is(result.id, 2);
});
