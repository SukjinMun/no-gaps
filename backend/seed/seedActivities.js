// Fills the activities collection for the seeded users. Run after seedUsers.js.
// Running it again replaces only the seeded activities; activities that
// people added through the app are never touched.
import { connectDB, closeDB } from "../db/connection.js";
import { ensureActivityIndexes } from "../db/activitiesDB.js";
import { buildSeedActivities } from "./buildSeedActivities.js";

async function main() {
  const db = await connectDB();
  await ensureActivityIndexes();

  const users = await db
    .collection("users")
    .find({ seed: true }, { projection: { username: 1 } })
    .sort({ username: 1 })
    .toArray();
  if (users.length === 0) {
    throw new Error("No seeded users found. Run seed/seedUsers.js first.");
  }

  const activities = db.collection("activities");
  const removed = await activities.deleteMany({ seed: true });
  const inserted = await activities.insertMany(buildSeedActivities(users));

  console.log(
    `Activities: removed ${removed.deletedCount} old seeded, inserted ${inserted.insertedCount} ` +
      `for ${users.length} users. Total in collection: ${await activities.countDocuments()}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDB);
