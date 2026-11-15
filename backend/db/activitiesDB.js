import { getDB } from "./connection.js";
import { asObjectId } from "./ids.js";

// Every query filters by userId, so a user can only ever see or change
// their own activities. userId always comes from the session.

const activities = () => getDB().collection("activities");

export async function ensureActivityIndexes() {
  await activities().createIndex({ userId: 1, startMonth: 1 });
}

// Newest first: current activities, then by end month, then by start month.
export async function listActivities(userId) {
  const owner = asObjectId(userId);
  if (!owner) return [];
  return activities()
    .find({ userId: owner })
    .sort({ isCurrent: -1, endMonth: -1, startMonth: -1 })
    .toArray();
}

export async function createActivity(userId, activity) {
  const now = new Date();
  const doc = { ...activity, userId: asObjectId(userId), createdAt: now, updatedAt: now };
  const result = await activities().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

// Returns the updated activity, or null if it doesn't exist or isn't the user's.
export async function updateActivity(userId, id, activity) {
  const _id = asObjectId(id);
  const owner = asObjectId(userId);
  if (!_id || !owner) return null;
  return activities().findOneAndUpdate(
    { _id, userId: owner },
    { $set: { ...activity, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
}

// Returns true if something was deleted.
export async function deleteActivity(userId, id) {
  const _id = asObjectId(id);
  const owner = asObjectId(userId);
  if (!_id || !owner) return false;
  const result = await activities().deleteOne({ _id, userId: owner });
  return result.deletedCount === 1;
}
