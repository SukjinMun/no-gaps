import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  checkAddresses,
  currentMonth,
  toIndex,
  toMonth,
} from "../utils/addressCheck.js";

const now = new Date("2026-11-15T12:00:00Z");

const place = (id, startMonth, endMonth = null) => ({
  _id: id,
  street: `${id} Street`,
  startMonth,
  endMonth,
  current: endMonth === null,
});

const short = (id) => ({ _id: id, street: `${id} Street` });

const check = (addresses, options = {}) =>
  checkAddresses(addresses, { now, ...options });

describe("month helpers", () => {
  test("toIndex counts months from year 0", () => {
    assert.equal(toIndex("2026-11"), 2026 * 12 + 10);
    assert.equal(toIndex("2026-01"), 24312);
  });

  test("toMonth is the inverse of toIndex", () => {
    assert.equal(toMonth(24322), "2026-11");
    assert.equal(toMonth(24311), "2025-12");
    assert.equal(toMonth(toIndex("2021-12")), "2021-12");
  });

  test("currentMonth uses UTC", () => {
    assert.equal(currentMonth(now), "2026-11");
    assert.equal(
      currentMonth(new Date("2026-11-30T23:30:00-05:00")),
      "2026-12",
    );
    assert.equal(
      currentMonth(new Date("2026-12-01T02:00:00+05:00")),
      "2026-11",
    );
  });
});

describe("checkAddresses", () => {
  test("no address is one gap of 60 months", () => {
    assert.deepEqual(check([]), {
      years: 5,
      from: "2021-12",
      to: "2026-11",
      totalMonths: 60,
      coveredMonths: 0,
      gaps: [{ from: "2021-12", to: "2026-11", months: 60 }],
      overlaps: [],
      overlapMonths: 0,
    });
  });

  test("one current address covers the whole range", () => {
    const result = check([place("a", "2020-01")]);
    assert.equal(result.coveredMonths, 60);
    assert.deepEqual(result.gaps, []);
    assert.deepEqual(result.overlaps, []);
    assert.equal(result.overlapMonths, 0);
  });

  test("months between two addresses are a gap", () => {
    const result = check([
      place("a", "2020-01", "2023-05"),
      place("b", "2023-09"),
    ]);
    assert.deepEqual(result.gaps, [
      { from: "2023-06", to: "2023-08", months: 3 },
    ]);
    assert.equal(result.coveredMonths, 57);
  });

  test("months before the first address are a gap at the start", () => {
    const result = check([place("a", "2022-03")]);
    assert.deepEqual(result.gaps, [
      { from: "2021-12", to: "2022-02", months: 3 },
    ]);
    assert.equal(result.coveredMonths, 57);
  });

  test("months after the last ended address are a gap at the end", () => {
    const result = check([place("a", "2020-01", "2026-08")]);
    assert.deepEqual(result.gaps, [
      { from: "2026-09", to: "2026-11", months: 3 },
    ]);
    assert.equal(result.coveredMonths, 57);
  });

  test("the shared move month is not an overlap", () => {
    const result = check([
      place("a", "2020-01", "2024-03"),
      place("b", "2024-03"),
    ]);
    assert.deepEqual(result.overlaps, []);
    assert.equal(result.overlapMonths, 0);
    assert.deepEqual(result.gaps, []);
    assert.equal(result.coveredMonths, 60);
  });

  test("an overlap runs from the later start to the earlier end", () => {
    const result = check([
      place("b", "2024-03"),
      place("a", "2020-01", "2024-04"),
    ]);
    assert.deepEqual(result.overlaps, [
      {
        from: "2024-03",
        to: "2024-04",
        months: 2,
        addresses: [short("a"), short("b")],
      },
    ]);
    assert.equal(result.overlapMonths, 2);
  });

  test("an address inside another one overlaps for all its months", () => {
    const result = check([
      place("b", "2023-02", "2023-05"),
      place("a", "2020-01"),
    ]);
    assert.deepEqual(result.overlaps, [
      {
        from: "2023-02",
        to: "2023-05",
        months: 4,
        addresses: [short("a"), short("b")],
      },
    ]);
    assert.equal(result.overlapMonths, 4);
  });

  test("two current addresses overlap up to the current month", () => {
    const result = check([place("a", "2022-01"), place("b", "2025-06")]);
    assert.deepEqual(result.overlaps, [
      {
        from: "2025-06",
        to: "2026-11",
        months: 18,
        addresses: [short("a"), short("b")],
      },
    ]);
    assert.equal(result.overlapMonths, 18);
    assert.deepEqual(result.gaps, [
      { from: "2021-12", to: "2021-12", months: 1 },
    ]);
    assert.equal(result.coveredMonths, 59);
  });

  test("an address before the range is ignored", () => {
    const result = check([place("a", "2015-01", "2019-12")]);
    assert.equal(result.coveredMonths, 0);
    assert.deepEqual(result.gaps, [
      { from: "2021-12", to: "2026-11", months: 60 },
    ]);
  });

  test("an overlap before the range is left out", () => {
    const result = check([
      place("a", "2015-01", "2018-06"),
      place("b", "2018-01", "2019-12"),
    ]);
    assert.deepEqual(result.overlaps, []);
    assert.equal(result.overlapMonths, 0);
  });

  test("an address that starts before the range counts from the range start", () => {
    const result = check([place("a", "2019-05", "2023-02")]);
    assert.equal(result.coveredMonths, 15);
    assert.deepEqual(result.gaps, [
      { from: "2023-03", to: "2026-11", months: 45 },
    ]);
  });

  test("months after the current month are ignored", () => {
    const result = check([place("a", "2024-01", "2027-06")]);
    assert.equal(result.coveredMonths, 35);
    assert.deepEqual(result.gaps, [
      { from: "2021-12", to: "2023-12", months: 25 },
    ]);
  });

  test("gaps and overlaps are sorted newest first", () => {
    const result = check([
      place("c", "2024-02", "2025-01"),
      place("e", "2025-08"),
      place("a", "2021-01", "2022-05"),
      place("d", "2025-04", "2025-10"),
      place("b", "2022-09", "2024-04"),
    ]);
    assert.deepEqual(result.gaps, [
      { from: "2025-02", to: "2025-03", months: 2 },
      { from: "2022-06", to: "2022-08", months: 3 },
    ]);
    assert.deepEqual(result.overlaps, [
      {
        from: "2025-08",
        to: "2025-10",
        months: 3,
        addresses: [short("d"), short("e")],
      },
      {
        from: "2024-02",
        to: "2024-04",
        months: 3,
        addresses: [short("b"), short("c")],
      },
    ]);
    assert.equal(result.coveredMonths, 55);
    assert.equal(result.overlapMonths, 6);
  });

  test("covered and overlap months count each month once", () => {
    const result = check([
      place("a", "2020-01"),
      place("b", "2023-01", "2023-06"),
      place("c", "2023-04", "2023-09"),
    ]);
    assert.deepEqual(
      result.overlaps.map(({ from }) => from),
      ["2023-04", "2023-04", "2023-01"],
    );
    assert.equal(result.coveredMonths, 60);
    assert.equal(result.overlapMonths, 9);
  });

  test("years: 10 checks the last 120 months", () => {
    const result = check([place("a", "2018-01")], { years: 10 });
    assert.equal(result.years, 10);
    assert.equal(result.from, "2016-12");
    assert.equal(result.to, "2026-11");
    assert.equal(result.totalMonths, 120);
    assert.equal(result.coveredMonths, 107);
    assert.deepEqual(result.gaps, [
      { from: "2016-12", to: "2017-12", months: 13 },
    ]);
  });
});
