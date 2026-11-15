// Passport setup: username + password login checked against the users
// collection, with only the user's id stored in the session.
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import * as usersDB from "../db/usersDB.js";
import { makeVerifyUser } from "./verifyUser.js";

passport.use(new LocalStrategy(makeVerifyUser(usersDB, bcrypt.compare)));

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersDB.findUserById(id);
    // req.user only ever holds the id and username, never the hash.
    done(null, user ? { _id: user._id, username: user.username } : false);
  } catch (error) {
    done(error);
  }
});

export default passport;
