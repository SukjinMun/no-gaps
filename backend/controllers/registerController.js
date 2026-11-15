const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;

// Handler for POST /api/register. `users` is the database layer
// (usersDB.js) and `hashPassword` is bcrypt.hash; both are passed in so
// the tests can use fakes.
export function makeRegisterController(users, hashPassword) {
  return {
    async register(req, res) {
      const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      const errors = {};

      if (!USERNAME_PATTERN.test(username)) {
        errors.username = "Use 3–30 letters, numbers, dots, dashes or underscores.";
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
      }
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      const passwordHash = await hashPassword(password);
      const user = await users.createUser({ username, passwordHash });
      if (!user) {
        return res.status(409).json({ errors: { username: "That username is taken." } });
      }

      // Never send the hash back.
      res.status(201).json({ username: user.username });
    },
  };
}
