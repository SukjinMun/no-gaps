import { createApp } from "./app.js";
import { connectDB } from "./db/connection.js";
import { ensureActivityIndexes } from "./db/activitiesDB.js";
import { ensureUserIndexes } from "./db/usersDB.js";

const PORT = process.env.PORT || 3000;

await connectDB();
await ensureUserIndexes();
await ensureActivityIndexes();

createApp().listen(PORT, () => {
  console.log(`No Gaps API listening on http://localhost:${PORT}`);
});
