import { test } from "node:test";
import assert from "node:assert/strict";
import { makeVerifyUser } from "../auth/verifyUser.js";

const stored = { _id: "1", username: "maria", passwordHash: "hashed:secret123" };
const users = { findUserByUsername: async (name) => (name === "maria" ? stored : null) };
const compare = async (password, hash) => hash === `hashed:${password}`;
const verify = makeVerifyUser(users, compare);

// Calls the Passport-style callback and returns what it was given.
const run = (username, password) =>
  new Promise((resolve) => verify(username, password, (...args) => resolve(args)));

test("right username and password log in", async () => {
  const [error, user] = await run("maria", "secret123");
  assert.equal(error, null);
  assert.equal(user, stored);
});

test("wrong password is refused", async () => {
  const [error, user, info] = await run("maria", "nope");
  assert.equal(error, null);
  assert.equal(user, false);
  assert.equal(info.message, "Wrong username or password.");
});

test("unknown username gets the same message as a wrong password", async () => {
  const [, user, info] = await run("nobody", "secret123");
  assert.equal(user, false);
  assert.equal(info.message, "Wrong username or password.");
});

test("spaces around the username are ignored", async () => {
  const [, user] = await run("  maria ", "secret123");
  assert.equal(user, stored);
});

test("a database error is passed on, not swallowed", async () => {
  const broken = makeVerifyUser(
    {
      findUserByUsername: async () => {
        throw new Error("db down");
      },
    },
    compare,
  );
  const [error] = await new Promise((resolve) => broken("maria", "x", (...a) => resolve(a)));
  assert.equal(error.message, "db down");
});
