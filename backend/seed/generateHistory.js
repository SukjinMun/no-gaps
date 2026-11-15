import { indexToMonth } from "../utils/months.js";
import {
  AREA_CODES,
  COMPANIES,
  FIRST_NAMES,
  JOB_TITLES,
  LAST_NAMES,
  OTHER_REASONS,
  PROGRAMS,
  SCHOOLS,
  SUPERVISOR_ROLES,
} from "./seedData.js";

// Small seeded random generator, so every run of the seed makes the same data.
export function makeRandom(seed) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (list) => list[Math.floor(next() * list.length)],
    chance: (probability) => next() < probability,
  };
}

const YEARS_BACK = 12;

// Builds one person's history, walking back from the reference month:
// a current job or school, then older activities, sometimes with a gap
// between them and sometimes a part-time job during school.
export function generateHistory(random, refIndex) {
  const activities = [];
  const oldest = refIndex - YEARS_BACK * 12;

  const firstType = random.chance(0.8) ? "work" : "school";
  const firstStart = refIndex - random.int(6, 60) + 1;
  activities.push(makeActivity(random, firstType, firstStart, null));
  let cursor = firstStart - 1;

  while (cursor > oldest) {
    if (random.chance(0.3)) cursor -= random.int(1, 8); // a gap

    const roll = random.next();
    const type = roll < 0.6 ? "work" : roll < 0.85 ? "school" : "other";
    const length =
      type === "work"
        ? random.int(6, 48)
        : type === "school"
          ? random.int(12, 48)
          : random.int(2, 18);
    const end = cursor;
    const start = end - length + 1;
    activities.push(makeActivity(random, type, start, end));

    // Part-time job while studying (overlap is normal and not a gap).
    if (type === "school" && length >= 12 && random.chance(0.35)) {
      const partStart = start + random.int(0, 6);
      const partEnd = Math.min(end, partStart + random.int(4, 18));
      activities.push(makeActivity(random, "work", partStart, partEnd, " (part-time)"));
    }

    cursor = start - 1;
  }

  return activities;
}

function makeActivity(random, type, startIndex, endIndex, titleSuffix = "") {
  const isCurrent = endIndex === null;
  const base = {
    type,
    startMonth: indexToMonth(startIndex),
    endMonth: isCurrent ? null : indexToMonth(endIndex),
    isCurrent,
    notes: "",
  };

  if (type === "work") {
    return {
      ...base,
      organization: random.pick(COMPANIES),
      title: random.pick(JOB_TITLES) + titleSuffix,
      contact: makeContact(random, random.pick(SUPERVISOR_ROLES)),
    };
  }
  if (type === "school") {
    return {
      ...base,
      organization: random.pick(SCHOOLS),
      title: random.pick(PROGRAMS),
      contact: {
        name: "Registrar's Office",
        role: "Registrar",
        phone: makePhone(random),
        email: "",
      },
    };
  }
  return {
    ...base,
    organization: "",
    title: random.pick(OTHER_REASONS),
    contact: { name: "", role: "", phone: "", email: "" },
  };
}

function makeContact(random, role) {
  const first = random.pick(FIRST_NAMES);
  const last = random.pick(LAST_NAMES);
  return {
    name: `${first} ${last}`,
    role,
    phone: makePhone(random),
    email: `${first}.${last}@example.com`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""),
  };
}

function makePhone(random) {
  return `(${random.pick(AREA_CODES)}) 555-01${String(random.int(0, 99)).padStart(2, "0")}`;
}
