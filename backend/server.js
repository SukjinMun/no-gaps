import express from "express";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { connectToDatabase } from "./db/connection.js";
import passport from "./config/passport.js";
import authRouter from "./routes/Auth.js";
import addressesRouter from "./routes/Addresses.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontend = join(__dirname, "../frontend/dist");
const PORT = process.env.PORT || 3000;
const app = express();

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not defined");
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000, sameSite: "lax" },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

app.use(express.static(frontend));
app.get("*splat", (req, res) => res.sendFile("index.html", { root: frontend }));

try {
  await connectToDatabase();
  app.listen(PORT, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Server running at http://localhost:${PORT}`);
  });
} catch (error) {
  console.error("Failed to connect to MongoDB:", error.message);
  process.exit(1);
}
