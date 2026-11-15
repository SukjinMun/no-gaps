import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(uri);
let database;

export async function connectToDatabase() {
  await client.connect();
  database = client.db("noGaps");
  return database;
}

export function getDatabase() {
  return database;
}

export async function closeDatabase() {
  await client.close();
}
