import { computeGaps } from "../utils/activityGaps.js";
import { validateActivity } from "../utils/validateActivity.js";

const ALLOWED_YEARS = [5, 7, 10];

// Route handlers for /api/activities. `store` is the database layer
// (activitiesDB.js); passing it in lets the tests use a fake one.
// req.user is set by Passport from the session.
export function makeActivitiesController(store) {
  return {
    async list(req, res) {
      const activities = await store.listActivities(req.user._id);
      res.json(activities);
    },

    async gaps(req, res) {
      const requested = Number(req.query.years);
      const years = ALLOWED_YEARS.includes(requested) ? requested : 10;
      const activities = await store.listActivities(req.user._id);
      res.json(computeGaps(activities, { years }));
    },

    async create(req, res) {
      const { errors, activity } = validateActivity(req.body);
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }
      const created = await store.createActivity(req.user._id, activity);
      res.status(201).json(created);
    },

    async update(req, res) {
      const { errors, activity } = validateActivity(req.body);
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }
      const updated = await store.updateActivity(req.user._id, req.params.id, activity);
      if (!updated) {
        return res.status(404).json({ error: "Activity not found." });
      }
      res.json(updated);
    },

    async remove(req, res) {
      const deleted = await store.deleteActivity(req.user._id, req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Activity not found." });
      }
      res.status(204).end();
    },
  };
}
