import { MONTH_PATTERN } from "./addressCheck.js";

const REQUIRED = {
  street: "Enter the street address.",
  city: "Enter the city.",
  country: "Enter the country.",
};

const text = (value) => (typeof value === "string" ? value.trim() : "");

export function readAddress(body = {}) {
  const current = body.current === true;
  const address = {
    street: text(body.street),
    unit: text(body.unit),
    city: text(body.city),
    state: text(body.state),
    zip: text(body.zip),
    country: text(body.country),
    startMonth: text(body.startMonth),
    endMonth: current ? null : text(body.endMonth),
    current,
    landlordName: text(body.landlordName),
    landlordPhone: text(body.landlordPhone),
    landlordEmail: text(body.landlordEmail),
    notes: text(body.notes),
  };
  const errors = {};

  Object.entries(address).forEach(([field, value]) => {
    const limit = field === "notes" ? 1000 : 200;
    if (REQUIRED[field] && !value) {
      errors[field] = REQUIRED[field];
    } else if (typeof value === "string" && value.length > limit) {
      errors[field] = `Use at most ${limit} characters.`;
    }
  });

  if (
    address.landlordEmail &&
    !errors.landlordEmail &&
    !/^\S+@\S+\.\S+$/.test(address.landlordEmail)
  ) {
    errors.landlordEmail = "Enter a valid email address.";
  }

  if (!MONTH_PATTERN.test(address.startMonth)) {
    errors.startMonth = "Choose the start month.";
  }

  if (!current && !MONTH_PATTERN.test(address.endMonth)) {
    errors.endMonth = "Choose the end month, or check that you live here now.";
  } else if (!current && !errors.startMonth && address.endMonth < address.startMonth) {
    errors.endMonth = "The end month can't be before the start month.";
  }

  return { address, errors };
}
