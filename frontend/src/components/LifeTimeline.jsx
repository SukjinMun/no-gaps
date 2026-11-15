import PropTypes from "prop-types";
import { activityShape, segmentShape } from "../utils/activityShape.js";
import { formatMonth, formatPeriod } from "../utils/months.js";
import "./LifeTimeline.css";

const TYPES = ["work", "school", "other"];
const LABELS = { work: "Work", school: "School", other: "Other" };

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

// One color per activity type; several types at once become a gradient.
function segmentBackground(types) {
  if (types.length === 0) return "var(--gap-fill)";
  const colors = types.map((type) => `var(--${type})`);
  return colors.length === 1 ? colors[0] : `linear-gradient(90deg, ${colors.join(", ")})`;
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
              className="life-timeline__segment"
              style={{
                flex: `${segment.months} ${segment.months} 0`,
                background: segmentBackground(types),
              }}
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
            <span className="life-timeline__swatch" style={{ background: `var(--${type})` }} />
            {LABELS[type]}
          </li>
        ))}
        <li>
          <span className="life-timeline__swatch" style={{ background: "var(--gap-fill)" }} />
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
