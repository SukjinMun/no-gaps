import { connectToDatabase, closeDatabase } from "../db/connection.js";
import { toIndex, toMonth, currentMonth } from "../utils/addressCheck.js";

const STREETS = [
  "Alder",
  "Maple",
  "Oak",
  "Cedar",
  "Pine",
  "Elm",
  "Birch",
  "Walnut",
  "Spruce",
  "Willow",
  "Chestnut",
  "Laurel",
  "Magnolia",
  "Juniper",
  "Sycamore",
  "Hawthorne",
  "Lincoln",
  "Washington",
  "Jefferson",
  "Madison",
  "Franklin",
  "Park",
  "Lake",
  "Hill",
];
const STREET_TYPES = ["St", "Ave", "Rd", "Blvd", "Dr", "Ln", "Ct", "Way"];
const CITIES = [
  ["Oakland", "CA", "94612", "510"],
  ["San Diego", "CA", "92101", "619"],
  ["Seattle", "WA", "98101", "206"],
  ["Portland", "OR", "97205", "503"],
  ["Denver", "CO", "80202", "303"],
  ["Phoenix", "AZ", "85004", "602"],
  ["Austin", "TX", "78701", "512"],
  ["Chicago", "IL", "60601", "312"],
  ["Minneapolis", "MN", "55401", "612"],
  ["Nashville", "TN", "37203", "615"],
  ["Atlanta", "GA", "30303", "404"],
  ["Miami", "FL", "33130", "305"],
  ["Philadelphia", "PA", "19103", "215"],
  ["Pittsburgh", "PA", "15222", "412"],
  ["New York", "NY", "10001", "212"],
  ["Boston", "MA", "02108", "617"],
];
const FIRST_NAMES = [
  "Maria",
  "James",
  "Linda",
  "Robert",
  "Ana",
  "David",
  "Grace",
  "Kevin",
  "Sofia",
  "Daniel",
  "Mei",
  "Carlos",
  "Emily",
  "Omar",
  "Priya",
  "Thomas",
  "Hannah",
  "Luis",
  "Nora",
  "Samuel",
];
const LAST_NAMES = [
  "Garcia",
  "Smith",
  "Nguyen",
  "Johnson",
  "Lopez",
  "Kim",
  "Brown",
  "Patel",
  "Davis",
  "Chen",
  "Martinez",
  "Wilson",
  "Hernandez",
  "Taylor",
  "Park",
  "Moore",
  "Rivera",
  "Clark",
  "Lee",
  "Walker",
];
// Demo moves, newest first: shared month, 3-month gap, shared, 2-month overlap, shared
const DEMO_STAYS = [12, 11, 13, 10, 14, 12];
const DEMO_MOVES = [0, -4, 0, 1, 0];

const randomInt = (min, max) =>
  min + Math.floor(Math.random() * (max - min + 1));

const pick = (items) => items[randomInt(0, items.length - 1)];

const randomMove = () => {
  const roll = Math.random();
  if (roll < 0.55) return 0;
  if (roll < 0.8) return -1;
  if (roll < 0.9) return -1 - randomInt(1, 4);
  return randomInt(2, 4) - 1;
};

const toSpans = (end, stays, moves) => {
  const spans = [];
  stays.forEach((stay, i) => {
    const start = end - stay + 1;
    spans.push({ start, end });
    end = start + (moves[i] ?? 0);
  });
  return spans;
};

const randomHistory = (now) => {
  const count = randomInt(5, 8);
  const end = Math.random() < 0.85 ? now : now - randomInt(1, 6);
  const stays = Array.from({ length: count }, () => randomInt(8, 40));
  return toSpans(end, stays, Array.from({ length: count }, randomMove));
};

const toAddress = (userId, { start, end }, now, date) => {
  const [city, state, zip, areaCode] = pick(CITIES);
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const unit = pick([
    `Apt ${randomInt(1, 9)}${pick(["A", "B", "C", "D"])}`,
    `Unit ${randomInt(1, 40)}`,
  ]);
  return {
    userId,
    street: `${randomInt(100, 9999)} ${pick(STREETS)} ${pick(STREET_TYPES)}`,
    unit: Math.random() < 0.75 ? "" : unit,
    city,
    state,
    zip,
    country: "United States",
    startMonth: toMonth(start),
    endMonth: end === now ? null : toMonth(end),
    current: end === now,
    landlordName: `${firstName} ${lastName}`,
    landlordPhone: `(${areaCode}) 555-01${String(randomInt(0, 99)).padStart(2, "0")}`,
    landlordEmail:
      Math.random() < 0.5
        ? ""
        : `${firstName}.${lastName}@example.com`.toLowerCase(),
    notes: "",
    seeded: true,
    createdAt: date,
    updatedAt: date,
  };
};

async function seed() {
  try {
    const db = await connectToDatabase();
    const users = await db
      .collection("users")
      .find({}, { projection: { username: 1 } })
      .toArray();

    if (users.length === 0) {
      console.error("No users found. Run the users seed first.");
      process.exitCode = 1;
      return;
    }

    const addresses = db.collection("addresses");
    if (await addresses.findOne({ seeded: true })) {
      console.log("Addresses already seeded");
      return;
    }

    const now = toIndex(currentMonth());
    const date = new Date();
    const docs = users.flatMap(({ _id, username }) => {
      const spans = username.startsWith("demo")
        ? toSpans(now, DEMO_STAYS, DEMO_MOVES)
        : randomHistory(now);
      return spans.map((span) => toAddress(_id, span, now, date));
    });

    await addresses.insertMany(docs);
    await addresses.createIndex({ userId: 1, startMonth: -1 });
    console.log(`Addresses inserted: ${docs.length} for ${users.length} users`);
    if (docs.length < 1000) {
      console.warn(`Only ${docs.length} addresses, fewer than 1000.`);
    }
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

seed();
