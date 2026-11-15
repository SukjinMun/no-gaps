import express from "express";
import passport from "../auth/passport.js";

const router = express.Router();

// POST /api/login  { username, password }
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) return next(error);
    if (!user) return res.status(401).json({ error: info?.message ?? "Please try again." });

    req.logIn(user, (loginError) => {
      if (loginError) return next(loginError);
      res.json({ username: user.username });
    });
  })(req, res, next);
});

// POST /api/logout
router.post("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(204).end();
    });
  });
});

// GET /api/me  -> who is logged in (the frontend calls this on load)
router.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in." });
  res.json({ username: req.user.username });
});

export default router;
