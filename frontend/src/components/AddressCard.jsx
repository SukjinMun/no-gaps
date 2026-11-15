import { useState } from "react";
import PropTypes from "prop-types";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { formatRange } from "../utils/addressMonths.js";
import "./AddressCard.css";

export default function AddressCard({ address, overlapping, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  const stateAndZip = [address.state, address.zip].filter(Boolean).join(" ");
  let place = [address.city, stateAndZip].filter(Boolean).join(", ");
  if (address.country !== "United States") {
    place = `${place} · ${address.country}`;
  }

  const landlord = [address.landlordName, address.landlordPhone, address.landlordEmail].filter(
    Boolean,
  );

  return (
    <article className="address-card">
      <div className="address-card-dates">
        <strong>
          {formatRange(address.startMonth, address.current ? null : address.endMonth)}
        </strong>
        <div className="address-card-badges">
          {address.current && (
            <Badge pill bg="" className="address-card-badge address-card-badge-current">
              Current
            </Badge>
          )}
          {overlapping && (
            <Badge pill bg="" className="address-card-badge address-card-badge-overlap">
              Overlap
            </Badge>
          )}
        </div>
      </div>

      <div className="address-card-details">
        <h3 className="address-card-street">
          {address.unit ? `${address.street}, ${address.unit}` : address.street}
        </h3>
        <p className="address-card-place">{place}</p>
        {landlord.length > 0 && (
          <p className="address-card-line">Landlord: {landlord.join(" · ")}</p>
        )}
        {address.notes !== "" && <p className="address-card-line">{address.notes}</p>}
      </div>

      <div className="address-card-actions">
        {confirming ? (
          <>
            <span className="address-card-confirm">Delete this address?</span>
            <Button
              variant="danger"
              className="address-card-button address-card-button-danger-solid"
              onClick={() => onDelete(address._id)}
            >
              Yes, delete
            </Button>
            <Button
              variant="outline-secondary"
              className="address-card-button"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              as={Link}
              variant="outline-primary"
              className="address-card-button address-card-button-edit"
              to={`/addresses/${encodeURIComponent(address._id)}/edit`}
              aria-label={`Edit ${address.street}`}
            >
              Edit
            </Button>
            <Button
              variant="outline-danger"
              className="address-card-button address-card-button-danger"
              aria-label={`Delete ${address.street}`}
              onClick={() => setConfirming(true)}
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </article>
  );
}

AddressCard.propTypes = {
  address: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    street: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    zip: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    startMonth: PropTypes.string.isRequired,
    endMonth: PropTypes.string,
    current: PropTypes.bool.isRequired,
    landlordName: PropTypes.string.isRequired,
    landlordPhone: PropTypes.string.isRequired,
    landlordEmail: PropTypes.string.isRequired,
    notes: PropTypes.string.isRequired,
  }).isRequired,
  overlapping: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
};
