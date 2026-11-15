import PropTypes from "prop-types";
import { gapShape } from "../utils/activityShape.js";
import { formatMonth, formatPeriod } from "../utils/months.js";
import "./GapSummary.css";

// Below this share the text no longer fits inside its part of the bar.
const MIN_LABEL_PERCENT = 30;

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

export default function GapSummary({ summary, onAddForGap }) {
  const { range, totalMonths, coveredMonths, explainedMonths, unrecordedMonths, gaps } = summary;
  const coveredPercent = Math.round((coveredMonths / totalMonths) * 100);
  const missingPercent = 100 - coveredPercent;

  return (
    <section className="gap-summary" aria-labelledby="gap-title">
      <div className="gap-summary__header">
        <h2 id="gap-title">Gap check</h2>
        <span className="gap-summary__range">
          Last {range.years} years · {formatMonth(range.start)} – {formatMonth(range.end)}
        </span>
      </div>

      <dl className="gap-summary__stats">
        <div>
          <dt>months covered</dt>
          <dd>
            {coveredMonths} / {totalMonths}
          </dd>
        </div>
        <div>
          <dt>{plural(unrecordedMonths, "month")} unrecorded</dt>
          <dd className={gaps.length > 0 ? "gap-summary__value--gap" : "gap-summary__value--ok"}>
            {gaps.length === 0 ? "No gaps" : plural(gaps.length, "gap")}
          </dd>
        </div>
        <div>
          <dt>explained (other activity)</dt>
          <dd className="gap-summary__value--explained">{plural(explainedMonths, "month")}</dd>
        </div>
      </dl>

      <div
        className="gap-summary__bar"
        role="img"
        aria-label={`${coveredPercent}% of the last ${range.years} years recorded, ${missingPercent}% unrecorded`}
      >
        <div className="gap-summary__bar-fill" style={{ width: `${coveredPercent}%` }}>
          {coveredPercent >= MIN_LABEL_PERCENT && `${coveredPercent}% recorded`}
        </div>
        {missingPercent >= MIN_LABEL_PERCENT && (
          <span className="gap-summary__bar-missing">{missingPercent}% unrecorded</span>
        )}
      </div>

      {gaps.length > 0 && (
        <ul className="gap-summary__gaps">
          {gaps.map((gap) => (
            <li key={gap.start} className="gap-summary__gap">
              <span>
                <strong>{formatPeriod(gap.start, gap.end)}</strong> · {plural(gap.months, "month")}{" "}
                unrecorded
              </span>
              <button type="button" className="gap-summary__fill" onClick={() => onAddForGap(gap)}>
                Add activity for these months
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

GapSummary.propTypes = {
  summary: PropTypes.shape({
    range: PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
      years: PropTypes.number.isRequired,
    }).isRequired,
    totalMonths: PropTypes.number.isRequired,
    coveredMonths: PropTypes.number.isRequired,
    explainedMonths: PropTypes.number.isRequired,
    unrecordedMonths: PropTypes.number.isRequired,
    gaps: PropTypes.arrayOf(gapShape).isRequired,
  }).isRequired,
  onAddForGap: PropTypes.func.isRequired,
};
