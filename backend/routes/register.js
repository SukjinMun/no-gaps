import express from "express";
import bcrypt from "bcrypt";
import * as usersDB from "../db/usersDB.js";
import { makeRegisterController } from "../controllers/registerController.js";

const SALT_ROUNDS = 10;

const router = express.Router();
const controller = makeRegisterController(usersDB, (password) =>
  bcrypt.hash(password, SALT_ROUNDS),
);

router.post("/", (req, res, next) => controller.register(req, res).catch(next));

export default router;
