import express from "express";
import passport from "../config/passport.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login?failed=1",
  }),
);

router.get("/user", isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

router.get("/logout", (req, res, next) => {
  req.logout((error) => (error ? next(error) : res.redirect("/")));
});

export default router;
