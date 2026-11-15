// Run with: node --test   (from the backend folder; no extra packages needed)
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeGaps } from "../utils/activityGaps.js";
import { validateActivity } from "../utils/validateActivity.js";

// Example range from the plan: Jan 2017 – Dec 2026 (10 years).
const OPTIONS = { years: 10, refMonth: "2026-12" };

const work = (startMonth, endMonth) => ({ type: "work", startMonth, endMonth });
const school = (startMonth, endMonth) => ({ type: "school", startMonth, endMonth });
const other = (startMonth, endMonth) => ({ type: "other", startMonth, endMonth });
const current = (startMonth) => ({ type: "work", startMonth, isCurrent: true });

test("range covers the last 10 years, current month included", () => {
  const result = computeGaps([], OPTIONS);
  assert.deepEqual(result.range, { start: "2017-01", end: "2026-12", years: 10 });
  assert.equal(result.totalMonths, 120);
});

test("1. full coverage has no gaps", () => {
  const result = computeGaps([current("2017-01")], OPTIONS);
  assert.deepEqual(result.gaps, []);
  assert.equal(result.coveredMonths, 120);
});

test("2. one gap in the middle", () => {
  const result = computeGaps([work("2017-01", "2020-05"), current("2020-09")], OPTIONS);
  assert.deepEqual(result.gaps, [{ start: "2020-06", end: "2020-08", months: 3 }]);
});

test("3. several gaps", () => {
  const result = computeGaps(
    [work("2017-01", "2018-12"), work("2019-03", "2021-06"), current("2021-10")],
    OPTIONS,
  );
  assert.deepEqual(result.gaps, [
    { start: "2019-01", end: "2019-02", months: 2 },
    { start: "2021-07", end: "2021-09", months: 3 },
  ]);
});

test("4. school and work at the same time are not a problem", () => {
  const result = computeGaps([school("2017-01", "2020-12"), current("2019-06")], OPTIONS);
  assert.deepEqual(result.gaps, []);
  assert.equal(result.coveredMonths, 120);
});

test("5. an activity inside another one does not create a gap", () => {
  const result = computeGaps([current("2017-01"), work("2021-03", "2021-04")], OPTIONS);
  assert.deepEqual(result.gaps, []);
});

test("6. a current activity runs to the reference month", () => {
  const result = computeGaps([work("2017-01", "2024-12"), current("2025-01")], OPTIONS);
  assert.deepEqual(result.gaps, []);
});

test("7. gaps at both ends of the range", () => {
  const result = computeGaps([work("2017-03", "2026-08")], OPTIONS);
  assert.deepEqual(result.gaps, [
    { start: "2017-01", end: "2017-02", months: 2 },
    { start: "2026-09", end: "2026-12", months: 4 },
  ]);
});

test("8. empty history is one gap over the whole range", () => {
  const result = computeGaps([], OPTIONS);
  assert.deepEqual(result.gaps, [{ start: "2017-01", end: "2026-12", months: 120 }]);
  assert.equal(result.coveredMonths, 0);
});

test("9. an 'other' activity explains the months", () => {
  const result = computeGaps(
    [work("2017-01", "2020-05"), other("2020-06", "2020-08"), current("2020-09")],
    OPTIONS,
  );
  assert.deepEqual(result.gaps, []);
  assert.equal(result.explainedMonths, 3);
});

test("9b. months with work and 'other' count as covered, not explained", () => {
  const result = computeGaps([current("2017-01"), other("2020-01", "2020-03")], OPTIONS);
  assert.equal(result.explainedMonths, 0);
});

test("10. end before start is rejected on save", () => {
  const { errors } = validateActivity({
    type: "work",
    organization: "Harbor Lane Logistics",
    title: "Data Analyst",
    startMonth: "2020-03",
    endMonth: "2020-02",
  });
  assert.equal(errors.endMonth, "End month can't be before the start month.");
});

test("10b. the gap check ignores invalid dates instead of crashing", () => {
  const result = computeGaps([work("2020-03", "2020-02")], OPTIONS);
  assert.equal(result.coveredMonths, 0);
});

test("activities outside the range are clipped", () => {
  const result = computeGaps([work("2010-01", "2026-12")], OPTIONS);
  assert.deepEqual(result.gaps, []);
  assert.equal(result.coveredMonths, 120);
});

test("timeline: gaps and activities fill the whole range in order", () => {
  const jobs = [
    { _id: "a", ...work("2017-01", "2020-05") },
    { _id: "b", ...current("2020-09") },
  ];
  const { timeline } = computeGaps(jobs, OPTIONS);
  assert.deepEqual(timeline, [
    { start: "2017-01", end: "2020-05", months: 41, activityIds: ["a"] },
    { start: "2020-06", end: "2020-08", months: 3, activityIds: [] },
    { start: "2020-09", end: "2026-12", months: 76, activityIds: ["b"] },
  ]);
});

test("timeline: overlapping activities get their own segment with both ids", () => {
  const items = [
    { _id: "a", ...work("2017-01", "2026-12") },
    { _id: "b", ...school("2020-01", "2020-03") },
  ];
  const { timeline } = computeGaps(items, OPTIONS);
  const overlap = timeline.find((segment) => segment.activityIds.length === 2);
  assert.deepEqual(overlap, {
    start: "2020-01",
    end: "2020-03",
    months: 3,
    activityIds: ["a", "b"],
  });
  assert.equal(
    timeline.reduce((sum, segment) => sum + segment.months, 0),
    120,
  );
});

test("timeline: its empty segments match the gaps", () => {
  const { timeline, gaps } = computeGaps([work("2017-03", "2026-08")], OPTIONS);
  const empty = timeline
    .filter((segment) => segment.activityIds.length === 0)
    .map(({ start, end, months }) => ({ start, end, months }));
  assert.deepEqual(empty, gaps);
});

test("validation: 'other' needs only an explanation", () => {
  const { errors } = validateActivity({
    type: "other",
    title: "Family caregiving",
    startMonth: "2020-06",
    endMonth: "2020-08",
  });
  assert.deepEqual(errors, {});
});

test("validation: jobs need organization and title", () => {
  const { errors } = validateActivity({ type: "work", startMonth: "2020-01", isCurrent: true });
  assert.ok(errors.organization);
  assert.ok(errors.title);
  assert.equal(errors.endMonth, undefined);
});

test("validation: never keeps a userId from the browser", () => {
  const { activity } = validateActivity({
    type: "other",
    title: "Travel",
    startMonth: "2020-01",
    endMonth: "2020-02",
    userId: "someone-else",
  });
  assert.equal(activity.userId, undefined);
});
