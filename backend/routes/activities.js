import express from "express";
import * as activitiesDB from "../db/activitiesDB.js";
import { makeActivitiesController } from "../controllers/activitiesController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();
const controller = makeActivitiesController(activitiesDB);

// Express 4 doesn't catch errors from async handlers; this passes them on.
const wrap = (handler) => (req, res, next) => handler(req, res).catch(next);

router.use(requireAuth);

router.get("/", wrap(controller.list));
router.get("/gaps", wrap(controller.gaps));
router.post("/", wrap(controller.create));
router.put("/:id", wrap(controller.update));
router.delete("/:id", wrap(controller.remove));

export default router;
