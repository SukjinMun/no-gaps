import { useMemo } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/Form";
import { Link } from "react-router";
import AddressCard from "./AddressCard.jsx";
import { formatRange, monthsLabel } from "../utils/addressMonths.js";
import "./AddressTimeline.css";

export default function AddressTimeline({
  addresses,
  check,
  total,
  query,
  setQuery,
  onDelete,
}) {
  const rows = useMemo(() => {
    const merged = [
      ...addresses.map((address) => ({ start: address.startMonth, address })),
      ...check.gaps.map((gap) => ({ start: gap.from, gap })),
    ];
    return merged.sort(
      (a, b) =>
        b.start.localeCompare(a.start) || (a.gap ? 1 : 0) - (b.gap ? 1 : 0),
    );
  }, [addresses, check.gaps]);

  const isOverlapping = (id) =>
    check.overlaps.some((overlap) =>
      overlap.addresses.some((address) => address._id === id),
    );

  const renderCard = (address) => (
    <li key={address._id}>
      <AddressCard
        address={address}
        overlapping={isOverlapping(address._id)}
        onDelete={onDelete}
      />
    </li>
  );

  return (
    <section className="address-timeline" aria-label="Timeline">
      <div className="address-timeline-header">
        <div className="address-timeline-heading">
          <h2 className="address-timeline-title">Timeline</h2>
          <span className="small text-body-secondary">· newest first</span>
        </div>
        {total > 0 && (
          <Form.Label className="address-timeline-filter">
            Filter addresses
            <Form.Control
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Street, city or landlord"
            />
          </Form.Label>
        )}
      </div>

      {total === 0 && (
        <p>No addresses yet. Add your first address to start the timeline.</p>
      )}

      {total > 0 && query !== "" && (
        <>
          <p role="status">
            {addresses.length > 0
              ? `${addresses.length} of ${total} addresses match.`
              : "No address matches this filter."}
          </p>
          {addresses.length > 0 && (
            <ol className="address-timeline-list">
              {addresses.map(renderCard)}
            </ol>
          )}
        </>
      )}

      {total > 0 && query === "" && (
        <ol className="address-timeline-list">
          {rows.map((row) =>
            row.address ? (
              renderCard(row.address)
            ) : (
              <li key={row.gap.from} className="address-timeline-gap">
                <span>
                  <strong>{formatRange(row.gap.from, row.gap.to)}</strong> ·{" "}
                  {monthsLabel(row.gap.months)} unrecorded
                  {row.gap.from === check.from && " (start of range)"}
                </span>
                <Link
                  className="address-timeline-gap-link"
                  to={`/addresses/new?start=${encodeURIComponent(row.gap.from)}&end=${encodeURIComponent(row.gap.to)}`}
                >
                  Add an address here
                </Link>
              </li>
            ),
          )}
        </ol>
      )}
    </section>
  );
}

AddressTimeline.propTypes = {
  addresses: PropTypes.arrayOf(PropTypes.object).isRequired,
  check: PropTypes.shape({
    from: PropTypes.string.isRequired,
    gaps: PropTypes.arrayOf(PropTypes.object).isRequired,
    overlaps: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  total: PropTypes.number.isRequired,
  query: PropTypes.string.isRequired,
  setQuery: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
