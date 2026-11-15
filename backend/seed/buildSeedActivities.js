import { currentMonth, monthToIndex } from "../utils/months.js";
import { DEMO_ACCOUNTS } from "./demoAccounts.js";
import { generateHistory, makeRandom } from "./generateHistory.js";

const RANDOM_SEED = 20261118;

// Builds every seeded activity: the fixed demo histories plus a generated
// history for each synthetic user. `users` are { _id, username } from the DB.
export function buildSeedActivities(users, refMonth = currentMonth()) {
  const random = makeRandom(RANDOM_SEED);
  const refIndex = monthToIndex(refMonth);
  const now = new Date();
  const docs = [];

  for (const user of users) {
    const history = DEMO_ACCOUNTS[user.username] ?? generateHistory(random, refIndex);
    for (const activity of history) {
      docs.push({ ...activity, userId: user._id, seed: true, createdAt: now, updatedAt: now });
    }
  }
  return docs;
}
