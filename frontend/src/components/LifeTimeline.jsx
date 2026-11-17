import PropTypes from "prop-types";
import { activityShape, segmentShape } from "../utils/activityShape.js";
import { formatMonth, formatPeriod } from "../utils/months.js";
import "./LifeTimeline.css";

const TYPES = ["work", "school", "other"];
const LABELS = { work: "Work", school: "School", other: "Other" };

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

// The color comes from a CSS class named after the types that cover the segment, for example
// "work", "work-school" or "gap" when nothing covers it. The CSS file defines every combination.
function segmentColorClass(types) {
  return `life-timeline__color--${types.length === 0 ? "gap" : types.join("-")}`;
}

export default function LifeTimeline({ range, segments, activities, onGapClick, onActivityClick }) {
  const byId = new Map(activities.map((activity) => [activity._id, activity]));

  return (
    <section className="life-timeline" aria-labelledby="life-timeline-title">
      <h2 id="life-timeline-title" className="life-timeline__title">
        Your last {range.years} years
      </h2>

      <div className="life-timeline__bar">
        {segments.map((segment) => {
          const found = segment.activityIds.map((id) => byId.get(id)).filter(Boolean);
          const isGap = found.length === 0;
          const types = TYPES.filter((type) => found.some((activity) => activity.type === type));
          const period = formatPeriod(segment.start, segment.end);
          const description = isGap
            ? `${period} · ${plural(segment.months, "month")} unrecorded`
            : `${period} · ${found.map((a) => `${LABELS[a.type]}: ${a.title}`).join("; ")}`;

          return (
            <button
              key={segment.start}
              type="button"
              className={`life-timeline__segment ${segmentColorClass(types)} life-timeline__segment--m${segment.months}`}
              title={description}
              aria-label={`${description}. ${isGap ? "Add an activity for these months." : "Show it in the list."}`}
              onClick={() =>
                isGap
                  ? onGapClick({ start: segment.start, end: segment.end, months: segment.months })
                  : onActivityClick(found[0]._id)
              }
            />
          );
        })}
      </div>

      <div className="life-timeline__axis" aria-hidden="true">
        <span>{formatMonth(range.start)}</span>
        <span>{formatMonth(range.end)}</span>
      </div>

      <ul className="life-timeline__legend">
        {TYPES.map((type) => (
          <li key={type}>
            <span className={`life-timeline__swatch life-timeline__color--${type}`} />
            {LABELS[type]}
          </li>
        ))}
        <li>
          <span className="life-timeline__swatch life-timeline__color--gap" />
          Months unrecorded
        </li>
      </ul>
    </section>
  );
}

LifeTimeline.propTypes = {
  range: PropTypes.shape({
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired,
    years: PropTypes.number.isRequired,
  }).isRequired,
  segments: PropTypes.arrayOf(segmentShape).isRequired,
  activities: PropTypes.arrayOf(activityShape).isRequired,
  onGapClick: PropTypes.func.isRequired,
  onActivityClick: PropTypes.func.isRequired,
};
