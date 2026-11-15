import { isValidMonth, monthToIndex } from "./months.js";

const TYPES = ["work", "school", "other"];

// Checks an activity sent by the browser and returns
// { errors, activity }. `errors` maps each field to a message;
// `activity` keeps only the fields we store (never userId: that comes
// from the session).
export function validateActivity(body = {}) {
  const errors = {};
  const type = body.type;
  const organization = clean(body.organization);
  const title = clean(body.title);
  const isCurrent = body.isCurrent === true;
  const startMonth = body.startMonth;
  const endMonth = isCurrent ? null : body.endMonth;

  if (!TYPES.includes(type)) {
    errors.type = "Choose work, school or other.";
  }

  if (type !== "other" && !organization) {
    errors.organization = "Organization is required for jobs and schools.";
  }

  if (!title) {
    errors.title =
      type === "other" ? "Add a short explanation." : "Position or program is required.";
  }

  if (!isValidMonth(startMonth)) {
    errors.startMonth = "Start month is required (YYYY-MM).";
  }

  if (!isCurrent) {
    if (!isValidMonth(endMonth)) {
      errors.endMonth = "End month is required unless this is current.";
    } else if (isValidMonth(startMonth) && monthToIndex(endMonth) < monthToIndex(startMonth)) {
      errors.endMonth = "End month can't be before the start month.";
    }
  }

  const contact = body.contact ?? {};
  const activity = {
    type,
    organization,
    title,
    startMonth,
    endMonth,
    isCurrent,
    contact: {
      name: clean(contact.name),
      role: clean(contact.role),
      phone: clean(contact.phone),
      email: clean(contact.email),
    },
    notes: clean(body.notes),
  };

  return { errors, activity };
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}
