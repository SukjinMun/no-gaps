// Creates the demo accounts and the synthetic users. Run before any other
// seed (Suk's addresses seed uses these users' ids too).
//   npm run seed       (runs this file, then seedActivities.js)
// Running it again keeps the same users and ids (it updates, never duplicates).
import bcrypt from "bcrypt";
import { connectDB, closeDB } from "../db/connection.js";
import { ensureUserIndexes } from "../db/usersDB.js";
import { DEMO_ACCOUNTS } from "./demoAccounts.js";

export const SYNTHETIC_USER_COUNT = 200;
// Test-only password shared by every seeded account (listed in the README).
const DEMO_PASSWORD = "nogaps-demo";

export function seededUsernames() {
  const synthetic = Array.from(
    { length: SYNTHETIC_USER_COUNT },
    (_, i) => `user${String(i + 1).padStart(3, "0")}`,
  );
  return [...Object.keys(DEMO_ACCOUNTS), ...synthetic];
}

async function main() {
  const db = await connectDB();
  await ensureUserIndexes();

  // Hashing is slow on purpose, so hash the shared password once.
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const now = new Date();

  const operations = seededUsernames().map((username) => ({
    updateOne: {
      filter: { username },
      update: {
        $set: { passwordHash, seed: true },
        $setOnInsert: { username, createdAt: now },
      },
      upsert: true,
    },
  }));

  const result = await db.collection("users").bulkWrite(operations);
  console.log(
    `Users: ${result.upsertedCount} created, ${result.matchedCount} already there ` +
      `(${operations.length} seeded accounts, password "${DEMO_PASSWORD}").`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDB);
