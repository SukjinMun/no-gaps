// Blocks a route unless someone is logged in.
// Passport puts the logged-in user on req.user.
export function requireAuth(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ error: "Please log in." });
}
