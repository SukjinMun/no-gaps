// Month helpers shared by the gap check and the validation.
// A month is stored as a "YYYY-MM" string and turned into a number
// (year * 12 + month - 1) so months can be compared and subtracted.

const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isValidMonth(value) {
  return typeof value === "string" && MONTH_PATTERN.test(value);
}

export function monthToIndex(value) {
  const [, year, month] = value.match(MONTH_PATTERN);
  return Number(year) * 12 + Number(month) - 1;
}

export function indexToMonth(index) {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function currentMonth(date = new Date()) {
  return indexToMonth(date.getFullYear() * 12 + date.getMonth());
}
