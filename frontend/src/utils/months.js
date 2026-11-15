const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "2020-09" -> "Sep 2020"
export function formatMonth(value) {
  if (!value) return "";
  const [year, month] = value.split("-");
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

// "Sep 2020 – Present" or "Jun 2020 – Aug 2020"
export function formatPeriod(start, end, isCurrent = false) {
  return `${formatMonth(start)} – ${isCurrent ? "Present" : formatMonth(end)}`;
}
