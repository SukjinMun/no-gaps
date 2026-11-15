// Tests the route handlers with an in-memory fake database, so they run
// without MongoDB. The fake follows the same rules as activitiesDB.js:
// every operation is limited to the given user's activities.
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeActivitiesController } from "../controllers/activitiesController.js";
import { makeRegisterController } from "../controllers/registerController.js";

function fakeActivitiesStore() {
  const rows = [];
  let nextId = 1;
  return {
    rows,
    async listActivities(userId) {
      return rows.filter((row) => row.userId === userId);
    },
    async createActivity(userId, activity) {
      const row = { ...activity, _id: String(nextId++), userId };
      rows.push(row);
      return row;
    },
    async updateActivity(userId, id, activity) {
      const row = rows.find((r) => r._id === id && r.userId === userId);
      if (!row) return null;
      Object.assign(row, activity);
      return row;
    },
    async deleteActivity(userId, id) {
      const index = rows.findIndex((r) => r._id === id && r.userId === userId);
      if (index === -1) return false;
      rows.splice(index, 1);
      return true;
    },
  };
}

function fakeRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      return this;
    },
  };
}

const ana = { _id: "user-ana" };
const ben = { _id: "user-ben" };

const job = {
  type: "work",
  organization: "Harbor Lane Logistics",
  title: "Data Analyst",
  startMonth: "2020-09",
  isCurrent: true,
};

async function call(handler, req) {
  const res = fakeRes();
  await handler({ params: {}, query: {}, body: {}, ...req }, res);
  return res;
}

test("create saves a valid activity for the logged-in user", async () => {
  const store = fakeActivitiesStore();
  const c = makeActivitiesController(store);
  const res = await call(c.create, { user: ana, body: job });
  assert.equal(res.statusCode, 201);
  assert.equal(store.rows[0].userId, "user-ana");
});

test("create ignores a userId sent by the browser", async () => {
  const store = fakeActivitiesStore();
  const c = makeActivitiesController(store);
  await call(c.create, { user: ana, body: { ...job, userId: "user-ben" } });
  assert.equal(store.rows[0].userId, "user-ana");
});

test("create rejects invalid data with field errors", async () => {
  const c = makeActivitiesController(fakeActivitiesStore());
  const res = await call(c.create, {
    user: ana,
    body: { ...job, isCurrent: false, startMonth: "2020-09", endMonth: "2020-01" },
  });
  assert.equal(res.statusCode, 400);
  assert.ok(res.body.errors.endMonth);
});

test("privacy: list only returns the user's own activities", async () => {
  const store = fakeActivitiesStore();
  const c = makeActivitiesController(store);
  await call(c.create, { user: ana, body: job });
  const res = await call(c.list, { user: ben });
  assert.deepEqual(res.body, []);
});

test("privacy: a user can't edit or delete someone else's activity", async () => {
  const store = fakeActivitiesStore();
  const c = makeActivitiesController(store);
  const created = await call(c.create, { user: ana, body: job });
  const id = created.body._id;

  const edit = await call(c.update, {
    user: ben,
    params: { id },
    body: { ...job, title: "Hacked" },
  });
  assert.equal(edit.statusCode, 404);

  const del = await call(c.remove, { user: ben, params: { id } });
  assert.equal(del.statusCode, 404);
  assert.equal(store.rows[0].title, "Data Analyst");
});

test("owner can edit and delete", async () => {
  const store = fakeActivitiesStore();
  const c = makeActivitiesController(store);
  const created = await call(c.create, { user: ana, body: job });
  const id = created.body._id;

  const edit = await call(c.update, { user: ana, params: { id }, body: { ...job, title: "Lead" } });
  assert.equal(edit.statusCode, 200);
  assert.equal(edit.body.title, "Lead");

  const del = await call(c.remove, { user: ana, params: { id } });
  assert.equal(del.statusCode, 204);
  assert.equal(store.rows.length, 0);
});

test("gaps uses 10 years by default and only allows 5, 7 or 10", async () => {
  const c = makeActivitiesController(fakeActivitiesStore());
  const byDefault = await call(c.gaps, { user: ana });
  assert.equal(byDefault.body.range.years, 10);
  const seven = await call(c.gaps, { user: ana, query: { years: "7" } });
  assert.equal(seven.body.range.years, 7);
  const odd = await call(c.gaps, { user: ana, query: { years: "50" } });
  assert.equal(odd.body.range.years, 10);
});

// ---- register ----

function fakeUsers() {
  const users = [];
  return {
    users,
    async createUser({ username, passwordHash }) {
      if (users.some((u) => u.username === username)) return null;
      const user = { _id: String(users.length + 1), username, passwordHash };
      users.push(user);
      return user;
    },
  };
}

const fakeHash = async (password) => `hashed:${password}`;

test("register stores a hash, never the password, and doesn't return it", async () => {
  const store = fakeUsers();
  const c = makeRegisterController(store, fakeHash);
  const res = await call(c.register, { body: { username: "maria", password: "longenough" } });
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { username: "maria" });
  assert.equal(store.users[0].passwordHash, "hashed:longenough");
  assert.equal(store.users[0].password, undefined);
});

test("register rejects a taken username", async () => {
  const c = makeRegisterController(fakeUsers(), fakeHash);
  await call(c.register, { body: { username: "maria", password: "longenough" } });
  const res = await call(c.register, { body: { username: "maria", password: "different1" } });
  assert.equal(res.statusCode, 409);
});

test("register validates username and password", async () => {
  const c = makeRegisterController(fakeUsers(), fakeHash);
  const res = await call(c.register, { body: { username: "a b", password: "short" } });
  assert.equal(res.statusCode, 400);
  assert.ok(res.body.errors.username);
  assert.ok(res.body.errors.password);
});
