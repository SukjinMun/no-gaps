import { indexToMonth, isValidMonth, monthToIndex, currentMonth } from "./months.js";

// Finds the months with no job, school or explained activity in the last
// `years` years, ending at `refMonth` (the current month by default).
//
// Rules (agreed with Suk):
// - start and end months both count as covered
// - an activity with isCurrent runs to the reference month
// - overlapping activities are normal and are counted once
// - "other" activities cover months but are reported as explained
export function computeGaps(activities, { years = 10, refMonth = currentMonth() } = {}) {
  const rangeEnd = monthToIndex(refMonth);
  const rangeStart = rangeEnd - years * 12 + 1;
  const totalMonths = rangeEnd - rangeStart + 1;

  // One slot per month in the range: null = not recorded,
  // "explained" = only an "other" activity, "covered" = job or school.
  const months = new Array(totalMonths).fill(null);
  // The ids of the activities that cover each month, for the visual timeline.
  const monthIds = Array.from({ length: totalMonths }, () => []);

  activities.forEach((activity, position) => {
    const period = toPeriod(activity, rangeEnd);
    if (!period) return;

    const id = String(activity._id ?? position);
    const from = Math.max(period.start, rangeStart);
    const to = Math.min(period.end, rangeEnd);
    for (let i = from; i <= to; i++) {
      const slot = i - rangeStart;
      monthIds[slot].push(id);
      if (activity.type === "other") {
        if (months[slot] === null) months[slot] = "explained";
      } else {
        months[slot] = "covered";
      }
    }
  });

  const gaps = [];
  let gapStart = null;
  for (let slot = 0; slot <= totalMonths; slot++) {
    const isGap = slot < totalMonths && months[slot] === null;
    if (isGap && gapStart === null) gapStart = slot;
    if (!isGap && gapStart !== null) {
      gaps.push({
        start: indexToMonth(rangeStart + gapStart),
        end: indexToMonth(rangeStart + slot - 1),
        months: slot - gapStart,
      });
      gapStart = null;
    }
  }

  const unrecordedMonths = gaps.reduce((sum, gap) => sum + gap.months, 0);
  const explainedMonths = months.filter((m) => m === "explained").length;

  return {
    range: { start: indexToMonth(rangeStart), end: indexToMonth(rangeEnd), years },
    totalMonths,
    coveredMonths: totalMonths - unrecordedMonths,
    explainedMonths,
    unrecordedMonths,
    gaps,
    timeline: buildTimeline(monthIds, rangeStart),
  };
}

// Splits the range into consecutive segments that share the same set of
// activities. A segment with no activities is a gap.
function buildTimeline(monthIds, rangeStart) {
  const timeline = [];
  let first = 0;
  for (let slot = 1; slot <= monthIds.length; slot++) {
    const same = slot < monthIds.length && monthIds[slot].join() === monthIds[first].join();
    if (same) continue;
    timeline.push({
      start: indexToMonth(rangeStart + first),
      end: indexToMonth(rangeStart + slot - 1),
      months: slot - first,
      activityIds: monthIds[first],
    });
    first = slot;
  }
  return timeline;
}

// Turns an activity into numeric start/end months, or null if its dates
// are missing or invalid (those are rejected on save, so this is a guard).
function toPeriod(activity, rangeEnd) {
  if (!isValidMonth(activity.startMonth)) return null;
  const start = monthToIndex(activity.startMonth);

  let end;
  if (activity.isCurrent) {
    end = rangeEnd;
  } else if (isValidMonth(activity.endMonth)) {
    end = monthToIndex(activity.endMonth);
  } else {
    return null;
  }

  return end < start ? null : { start, end };
}
