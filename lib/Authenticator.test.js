import test from "ava";

test("Cannot add same device twice", t => {
    var Authenticator = require("./Authenticator");

    t.plan(2);

    Authenticator.addDevice({ authentication: { foo: "bar" } });
    Authenticator.addDevice({ authentication: { foo: "bar" } });
    Authenticator.addDevice({ authentication: { foo: "bar" } });

    t.is(Object.keys(Authenticator.authenticators).length, 1);
    t.is(
        Object.keys(Authenticator.getAuthenticator({ foo: "bar" }).valueSet)
            .length,
        1
    );
});

test("Same key path only creates one authenticator", t => {
    var Authenticator = require("./Authenticator");

    t.plan(1);

    Authenticator.addDevice({ authentication: { foo: "bar" } });
    Authenticator.addDevice({ authentication: { foo: "bim" } });
    Authenticator.addDevice({ authentication: { foo: "baz" } });

    Authenticator.addDevice({
        authentication: { "foo.bar": "bar", "bar.baz": "fizz" }
    });
    Authenticator.addDevice({
        authentication: { "foo.bar": "bim", "bar.baz": "buzz" }
    });
    Authenticator.addDevice({
        authentication: { "foo.bar": "baz", "bar.baz": "fizzbuzz" }
    });

    t.is(Object.keys(Authenticator.authenticators).length, 2);
});

test("authenticates matching key", t => {
    var Authenticator = require("./Authenticator");

    t.plan(1);

    Authenticator.addDevice({ authentication: { foo: "bar" }, id: 1 });
    Authenticator.addDevice({ authentication: { foo: "bim" }, id: 2 });
    Authenticator.addDevice({ authentication: { foo: "baz" }, id: 3 });

    var a = Authenticator.getAuthenticator({ foo: "bim" });
    var device = a.authenticate({ foo: "bim" });

    t.is(device.id, 2);
});

test("doesn't authenticate mismatching key", t => {
    var Authenticator = require("./Authenticator");

    t.plan(1);

    Authenticator.addDevice({ authentication: { foo: "bar" }, id: 1 });
    Authenticator.addDevice({ authentication: { foo: "bim" }, id: 2 });
    Authenticator.addDevice({ authentication: { foo: "baz" }, id: 3 });

    var a = Authenticator.getAuthenticator({ foo: "bim" });
    var result = a.authenticate({ foo: "nope" });

    t.false(result);
});

test("authenticates matching compound key", t => {
    var Authenticator = require("./Authenticator");

    t.plan(1);

    Authenticator.addDevice({
        authentication: { "a.b.c": "bar", "a.b.d": "bim", e: "baz" },
        id: 1
    });

    var a = Authenticator.getAuthenticator({
        "a.b.c": "bar",
        "a.b.d": "bim",
        e: "baz"
    });
    var result = a.authenticate({ a: { b: { c: "bar", d: "bim" } }, e: "baz" });

    t.is(result.id, 1);
});

test("doesn't authenticate mismatching compound key", t => {
    var Authenticator = require("./Authenticator");

    t.plan(1);

    Authenticator.addDevice({
        authentication: { "a.b.c": "bar", "a.b.d": "bim", e: "baz" },
        id: 1
    });

    var a = Authenticator.getAuthenticator({
        "a.b.c": "bar",
        "a.b.d": "bim",
        e: "baz"
    });
    var result = a.authenticate({
        a: { b: { c: "bar", d: "nope" } },
        e: "baz"
    });

    t.false(result);
});
