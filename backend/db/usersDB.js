import { getDB } from "./connection.js";
import { asObjectId } from "./ids.js";

const users = () => getDB().collection("users");

export async function findUserById(id) {
  const _id = asObjectId(id);
  if (!_id) return null;
  return users().findOne({ _id }, { projection: { passwordHash: 0 } });
}

export async function ensureUserIndexes() {
  await users().createIndex({ username: 1 }, { unique: true });
}

export async function findUserByUsername(username) {
  return users().findOne({ username });
}

// Returns the new user, or null if the username is already taken.
export async function createUser({ username, passwordHash }) {
  const doc = { username, passwordHash, createdAt: new Date() };
  try {
    const result = await users().insertOne(doc);
    return { ...doc, _id: result.insertedId };
  } catch (error) {
    if (error.code === 11000) return null; // duplicate username
    throw error;
  }
}
