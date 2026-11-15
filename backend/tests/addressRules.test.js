import { test } from "node:test";
import assert from "node:assert/strict";
import { readAddress } from "../utils/addressRules.js";

const body = (fields = {}) => ({
  street: "1420 Alder St",
  unit: "Apt 3",
  city: "Oakland",
  state: "CA",
  zip: "94612",
  country: "United States",
  startMonth: "2023-06",
  endMonth: "2024-02",
  current: false,
  landlordName: "Dana Lee",
  landlordPhone: "510-555-0101",
  landlordEmail: "dana@example.com",
  notes: "Second floor",
  ...fields,
});

test("a valid past address has no errors", () => {
  const { address, errors } = readAddress(body());
  assert.deepEqual(address, body());
  assert.deepEqual(errors, {});
});

test("a current address has endMonth null", () => {
  const { address, errors } = readAddress(body({ current: true, endMonth: "" }));
  assert.equal(address.current, true);
  assert.equal(address.endMonth, null);
  assert.deepEqual(errors, {});
});

test("street, city and country are required", () => {
  assert.deepEqual(readAddress(body({ street: "" })).errors, {
    street: "Enter the street address.",
  });
  assert.deepEqual(readAddress(body({ city: undefined })).errors, {
    city: "Enter the city.",
  });
  assert.deepEqual(readAddress(body({ country: "   " })).errors, {
    country: "Enter the country.",
  });
});

test("the start month is required", () => {
  assert.deepEqual(readAddress(body({ startMonth: "" })).errors, {
    startMonth: "Choose the start month.",
  });
});

test("a month must be YYYY-MM", () => {
  assert.deepEqual(readAddress(body({ startMonth: "2023-13" })).errors, {
    startMonth: "Choose the start month.",
  });
  assert.deepEqual(readAddress(body({ endMonth: "2024/02" })).errors, {
    endMonth: "Choose the end month, or check that you live here now.",
  });
});

test("the end month can't be before the start month", () => {
  assert.deepEqual(readAddress(body({ endMonth: "2023-05" })).errors, {
    endMonth: "The end month can't be before the start month.",
  });
  assert.deepEqual(readAddress(body({ endMonth: "2023-06" })).errors, {});
});

test("an address that is not current needs an end month", () => {
  assert.deepEqual(readAddress(body({ endMonth: "" })).errors, {
    endMonth: "Choose the end month, or check that you live here now.",
  });
});

test("the landlord email must look like an email", () => {
  assert.deepEqual(readAddress(body({ landlordEmail: "dana@example" })).errors, {
    landlordEmail: "Enter a valid email address.",
  });
  assert.deepEqual(readAddress(body({ landlordEmail: "" })).errors, {});
});

test("text fields allow 200 characters and notes 1000", () => {
  assert.deepEqual(readAddress(body({ city: "x".repeat(200) })).errors, {});
  assert.deepEqual(readAddress(body({ city: "x".repeat(201) })).errors, {
    city: "Use at most 200 characters.",
  });
  assert.deepEqual(readAddress(body({ notes: "x".repeat(1000) })).errors, {});
  assert.deepEqual(readAddress(body({ notes: "x".repeat(1001) })).errors, {
    notes: "Use at most 1000 characters.",
  });
});

test("text values are trimmed", () => {
  const { address } = readAddress(body({ street: "  1420 Alder St  ", startMonth: " 2023-06 " }));
  assert.equal(address.street, "1420 Alder St");
  assert.equal(address.startMonth, "2023-06");
});

test("non-string values become empty strings", () => {
  const { address, errors } = readAddress(body({ street: 42, unit: ["3"], current: "true" }));
  assert.equal(address.street, "");
  assert.equal(address.unit, "");
  assert.equal(address.current, false);
  assert.equal(errors.street, "Enter the street address.");
});

test("an undefined body gives an empty address with errors", () => {
  const { address, errors } = readAddress(undefined);
  assert.deepEqual(address, {
    street: "",
    unit: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    startMonth: "",
    endMonth: "",
    current: false,
    landlordName: "",
    landlordPhone: "",
    landlordEmail: "",
    notes: "",
  });
  assert.deepEqual(errors, {
    street: "Enter the street address.",
    city: "Enter the city.",
    country: "Enter the country.",
    startMonth: "Choose the start month.",
    endMonth: "Choose the end month, or check that you live here now.",
  });
});
