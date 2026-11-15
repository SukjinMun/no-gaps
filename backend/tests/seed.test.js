import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSeedActivities } from "../seed/buildSeedActivities.js";
import { DEMO_ACCOUNTS } from "../seed/demoAccounts.js";
import { computeGaps } from "../utils/activityGaps.js";
import { validateActivity } from "../utils/validateActivity.js";

const REF = "2026-11";
const synthetic = Array.from({ length: 200 }, (_, i) => ({
  _id: `id${i}`,
  username: `user${String(i + 1).padStart(3, "0")}`,
}));
const demo = Object.keys(DEMO_ACCOUNTS).map((username) => ({ _id: username, username }));
const docs = buildSeedActivities([...demo, ...synthetic], REF);

test("seed makes more than 1,000 activities", () => {
  assert.ok(docs.length > 1000, `only ${docs.length}`);
});

test("every seeded activity passes the same validation as the app", () => {
  for (const doc of docs) {
    const { errors } = validateActivity(doc);
    assert.deepEqual(errors, {}, JSON.stringify(doc));
  }
});

test("seed is the same on every run", () => {
  const again = buildSeedActivities([...demo, ...synthetic], REF);
  assert.deepEqual(
    again.map((d) => [d.title, d.startMonth]),
    docs.map((d) => [d.title, d.startMonth]),
  );
});

test("synthetic histories include gaps, overlaps and explained periods", () => {
  const byUser = new Map();
  for (const doc of docs) {
    byUser.set(doc.userId, [...(byUser.get(doc.userId) ?? []), doc]);
  }
  let withGaps = 0;
  let withExplained = 0;
  for (const [, activities] of byUser) {
    const result = computeGaps(activities, { refMonth: REF });
    if (result.gaps.length > 0) withGaps++;
    if (result.explainedMonths > 0) withExplained++;
  }
  assert.ok(withGaps > 20, `withGaps ${withGaps}`);
  assert.ok(withExplained > 20, `withExplained ${withExplained}`);
});

test("demo.gaps matches the mockup: 2 gaps of 3 months, 18 explained", () => {
  const result = computeGaps(
    docs.filter((d) => d.userId === "demo.gaps"),
    { refMonth: REF },
  );
  assert.deepEqual(result.gaps, [
    { start: "2016-12", end: "2017-02", months: 3 },
    { start: "2020-06", end: "2020-08", months: 3 },
  ]);
  assert.equal(result.coveredMonths, 114);
  assert.equal(result.explainedMonths, 18);
});

test("demo.complete and demo.explained have no gaps; demo.empty is all gap", () => {
  const gapsFor = (name) =>
    computeGaps(
      docs.filter((d) => d.userId === name),
      { refMonth: REF },
    ).gaps;
  assert.deepEqual(gapsFor("demo.complete"), []);
  assert.deepEqual(gapsFor("demo.explained"), []);
  assert.equal(gapsFor("demo.empty")[0].months, 120);
});

console.log(`Seeded activities: ${docs.length}`);
