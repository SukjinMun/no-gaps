export const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const toIndex = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);
  return year * 12 + monthNumber - 1;
};

export const toMonth = (index) =>
  `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;

export const currentMonth = (now = new Date()) => now.toISOString().slice(0, 7);

export function checkAddresses(addresses, { years = 5, now = new Date() } = {}) {
  const to = toIndex(currentMonth(now));
  const from = to - years * 12 + 1;
  const covered = new Array(years * 12).fill(false);
  const overlapped = new Array(years * 12).fill(false);
  const mark = (months, first, last) => {
    for (let i = Math.max(first, from); i <= Math.min(last, to); i++) {
      months[i - from] = true;
    }
  };

  const spans = addresses
    .map(({ _id, street, startMonth, endMonth, current }) => ({
      _id,
      street,
      first: toIndex(startMonth),
      last: current ? to : toIndex(endMonth),
    }))
    .sort((a, b) => a.first - b.first || a.last - b.last);

  const overlaps = [];
  spans.forEach((earlier, i) => {
    mark(covered, earlier.first, earlier.last);
    spans.slice(i + 1).forEach((later) => {
      const first = Math.max(later.first, from);
      const last = Math.min(earlier.last, later.last, to);
      // A later address that starts in the last month of the earlier one is a move
      if (later.first < earlier.last && first <= last) {
        mark(overlapped, first, last);
        overlaps.push({
          from: toMonth(first),
          to: toMonth(last),
          months: last - first + 1,
          addresses: [earlier, later].map(({ _id, street }) => ({
            _id,
            street,
          })),
        });
      }
    });
  });

  const gaps = [];
  let start = null;
  for (let i = from; i <= to + 1; i++) {
    const open = i <= to && !covered[i - from];
    if (open && start === null) {
      start = i;
    } else if (!open && start !== null) {
      gaps.push({
        from: toMonth(start),
        to: toMonth(i - 1),
        months: i - start,
      });
      start = null;
    }
  }

  return {
    years,
    from: toMonth(from),
    to: toMonth(to),
    totalMonths: years * 12,
    coveredMonths: covered.filter(Boolean).length,
    gaps: gaps.reverse(),
    overlaps: overlaps.sort((a, b) => toIndex(b.from) - toIndex(a.from)),
    overlapMonths: overlapped.filter(Boolean).length,
  };
}
