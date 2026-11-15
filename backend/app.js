import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "node:path";
import { fileURLToPath } from "node:url";
import passport from "./auth/passport.js";
import authRouter from "./routes/auth.js";
import activitiesRouter from "./routes/activities.js";
import addressesRouter from "./routes/Addresses.js";
import registerRouter from "./routes/register.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function createApp() {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not set. Add a long random string to .env.");
  }
  const isProduction = process.env.NODE_ENV === "production";

  const app = express();
  app.set("trust proxy", 1); // hosting services put a proxy in front of the app
  app.use(express.json());

  // Sessions are kept in MongoDB so logins survive a server restart.
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        dbName: process.env.DB_NAME || "nogaps",
      }),
      cookie: { httpOnly: true, sameSite: "lax", secure: isProduction, maxAge: WEEK_MS },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api", authRouter);
  app.use("/api/register", registerRouter);
  app.use("/api/activities", activitiesRouter);
  app.use("/api/addresses", addressesRouter);
  app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));

  // In production, Express also serves the built React app.
  const frontendDist = path.join(here, "../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => res.sendFile(path.join(frontendDist, "index.html")));

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  });

  return app;
}
