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

const formatMonth = (month) => {
  const [year, monthNumber] = month.split("-");
  return `${MONTH_NAMES[Number(monthNumber) - 1]} ${year}`;
};

export const formatRange = (from, to) =>
  `${formatMonth(from)} – ${to ? formatMonth(to) : "Present"}`;

export const monthsLabel = (count) => `${count} ${count === 1 ? "month" : "months"}`;
