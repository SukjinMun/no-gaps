import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatRange, monthsLabel } from "../utils/addressMonths.js";
import "./AddressGapCheck.css";

export default function AddressGapCheck({ check }) {
  const gapCount = check.gaps.length;
  const overlapCount = check.overlaps.length;

  let gapText = "No gaps";
  if (gapCount > 0) {
    gapText = `${gapCount} ${gapCount === 1 ? "gap" : "gaps"}`;
  }

  let overlapText = "No overlaps";
  if (overlapCount > 0) {
    overlapText = `${overlapCount} ${overlapCount === 1 ? "overlap" : "overlaps"}`;
  }

  return (
    <section className="address-gap-check" aria-label="Gap check">
      <div className="address-gap-check-header">
        <h2 className="address-gap-check-title">Gap check</h2>
        <p className="address-gap-check-range">
          Last {check.years} years · {formatRange(check.from, check.to)}
        </p>
      </div>

      <div className="address-gap-check-figures">
        <p className="address-gap-check-figure">
          <strong>
            {check.coveredMonths} / {check.totalMonths}
          </strong>
          <small>months covered</small>
        </p>
        <p
          className={`address-gap-check-figure${gapCount > 0 ? " address-gap-check-figure-gaps" : ""}`}
        >
          <strong>{gapText}</strong>
          <small>{monthsLabel(check.totalMonths - check.coveredMonths)} unrecorded</small>
        </p>
        <p
          className={`address-gap-check-figure${overlapCount > 0 ? " address-gap-check-figure-overlaps" : ""}`}
        >
          <strong>{overlapText}</strong>
          <small>{monthsLabel(check.overlapMonths)} at two addresses</small>
        </p>
      </div>

      <progress
        className="address-gap-check-progress"
        value={check.coveredMonths}
        max={check.totalMonths}
        aria-label="Months covered"
      />

      {gapCount === 0 && overlapCount === 0 ? (
        <p className="address-gap-check-clear">
          Every month of the last {check.years} years has one address.
        </p>
      ) : (
        <ul className="address-gap-check-list">
          {check.gaps.map((gap) => (
            <li key={gap.from} className="address-gap-check-gap">
              <span>
                <strong>{formatRange(gap.from, gap.to)}</strong> · {monthsLabel(gap.months)}{" "}
                unrecorded
                {gap.from === check.from && " (start of range)"}
              </span>
              <Link
                className="address-gap-check-fill"
                to={`/addresses/new?start=${encodeURIComponent(gap.from)}&end=${encodeURIComponent(gap.to)}`}
              >
                Add address for these months
              </Link>
            </li>
          ))}
          {check.overlaps.map((overlap) => (
            <li
              key={`${overlap.addresses[0]._id}-${overlap.addresses[1]._id}`}
              className="address-gap-check-overlap"
            >
              <span>
                <strong>{formatRange(overlap.from, overlap.to)}</strong> ·{" "}
                {monthsLabel(overlap.months)} at two addresses
              </span>
              <small className="address-gap-check-streets">
                {overlap.addresses.map((address) => address.street).join(" and ")}
              </small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

AddressGapCheck.propTypes = {
  check: PropTypes.shape({
    years: PropTypes.number.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    totalMonths: PropTypes.number.isRequired,
    coveredMonths: PropTypes.number.isRequired,
    gaps: PropTypes.arrayOf(PropTypes.object).isRequired,
    overlaps: PropTypes.arrayOf(PropTypes.object).isRequired,
    overlapMonths: PropTypes.number.isRequired,
  }).isRequired,
};
