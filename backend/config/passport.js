import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { myDBUsers } from "../db/MyDBUsers.js";

const failure = { message: "Username or password incorrect" };

passport.use(
  new LocalStrategy(async (username, password, done) => {
    // A JSON body can send objects, which would act as a MongoDB query
    if (typeof username !== "string" || typeof password !== "string") {
      return done(null, false, failure);
    }
    try {
      const user = await myDBUsers.findUserByUsername(username);
      if (!user) {
        return done(null, false, failure);
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return done(null, false, failure);
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

passport.serializeUser((user, done) => done(null, user._id.toString()));

passport.deserializeUser(async (id, done) => {
  try {
    return done(null, await myDBUsers.findUserById(id));
  } catch (error) {
    return done(error);
  }
});

export default passport;
