// The check Passport runs when someone logs in. `users` is usersDB.js and
// `compare` is bcrypt.compare; both are passed in so the tests can use fakes.
// The same message is used for a wrong username and a wrong password, so
// the login form doesn't reveal which usernames exist.
const WRONG = "Wrong username or password.";

export function makeVerifyUser(users, compare) {
  return async function verifyUser(username, password, done) {
    try {
      const user = await users.findUserByUsername(String(username).trim());
      if (!user) return done(null, false, { message: WRONG });

      const matches = await compare(password, user.passwordHash);
      if (!matches) return done(null, false, { message: WRONG });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  };
}
