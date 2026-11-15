import express from "express";
import { ObjectId } from "mongodb";
import { myDBAddresses } from "../db/MyDBAddresses.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { checkAddresses } from "../utils/addressCheck.js";
import { readAddress } from "../utils/addressRules.js";

const router = express.Router();
const NOT_FOUND = { error: "Address not found" };
const INVALID = "Please fix the marked fields.";

const serverError = (res, error) => {
  console.error("Addresses route error:", error);
  res.status(500).json({ error: "Internal Server Error" });
};

router.use(requireAuth);

router.param("id", (req, res, next, id) => {
  if (!ObjectId.isValid(id)) {
    return res.status(404).json(NOT_FOUND);
  }
  next();
});

// GET /api/addresses?q=
router.get("/", async (req, res) => {
  // Escapes regex characters so the filter is literal
  const text = String(req.query.q ?? "")
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const search = new RegExp(text, "i");
  const query = {
    $or: [{ street: search }, { city: search }, { landlordName: search }],
  };

  try {
    const all = await myDBAddresses.getAddresses(req.user._id);
    const addresses = text ? await myDBAddresses.getAddresses(req.user._id, query) : all;
    res.json({ addresses, check: checkAddresses(all), total: all.length });
  } catch (error) {
    serverError(res, error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const address = await myDBAddresses.getAddress(req.user._id, req.params.id);
    if (!address) {
      return res.status(404).json(NOT_FOUND);
    }
    res.json({ address });
  } catch (error) {
    serverError(res, error);
  }
});

router.post("/", async (req, res) => {
  const { address, errors } = readAddress(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: INVALID, errors });
  }

  try {
    const created = await myDBAddresses.createAddress(req.user._id, address);
    res.status(201).json({ address: created });
  } catch (error) {
    serverError(res, error);
  }
});

router.put("/:id", async (req, res) => {
  const { address, errors } = readAddress(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: INVALID, errors });
  }

  try {
    const updated = await myDBAddresses.updateAddress(req.user._id, req.params.id, address);
    if (!updated) {
      return res.status(404).json(NOT_FOUND);
    }
    res.json({ address: updated });
  } catch (error) {
    serverError(res, error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await myDBAddresses.deleteAddress(req.user._id, req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json(NOT_FOUND);
    }
    res.json({ ok: true });
  } catch (error) {
    serverError(res, error);
  }
});

export default router;
