import { ObjectId } from "mongodb";

const HEX_ID = /^[a-f\d]{24}$/i;

// Accepts an ObjectId or its 24-character hex string.
// Returns null for anything else, so a bad id becomes a 404, not a crash.
export function asObjectId(value) {
  if (value instanceof ObjectId) return value;
  if (typeof value === "string" && HEX_ID.test(value)) return new ObjectId(value);
  return null;
}
