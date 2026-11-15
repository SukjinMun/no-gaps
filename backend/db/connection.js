import { MongoClient } from "mongodb";

let client;
let db;

// Connects once and reuses the same connection everywhere.
export async function connectDB(
  uri = process.env.MONGO_URI,
  dbName = process.env.DB_NAME || "nogaps",
) {
  if (db) return db;
  if (!uri) {
    throw new Error("MONGO_URI is not set. Copy .env.example to .env and fill it in.");
  }
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export function getDB() {
  if (!db) throw new Error("Call connectDB() before using the database.");
  return db;
}

export async function closeDB() {
  await client?.close();
  client = undefined;
  db = undefined;
}
