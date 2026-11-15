import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import AddressField from "./AddressField.jsx";
import "./AddressForm.css";

export default function AddressForm({ initialAddress, errors, submitLabel, onSave }) {
  const [address, setAddress] = useState(initialAddress);
  const [saving, setSaving] = useState(false);
  const errorCount = Object.keys(errors).length;

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAddress({ ...address, [name]: type === "checkbox" ? checked : value });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    await onSave({
      ...address,
      endMonth: address.current ? "" : address.endMonth,
    });
    setSaving(false);
  };

  return (
    <form noValidate onSubmit={onSubmit} className="address-form">
      {errorCount > 0 && (
        <p role="alert" className="address-form-alert">
          {errors.form ??
            `Please fix ${errorCount} ${errorCount === 1 ? "field" : "fields"} before saving.`}
        </p>
      )}

      <div className="address-form-row address-form-row-street">
        <AddressField
          label="Street address"
          name="street"
          value={address.street}
          onChange={onChange}
          error={errors.street}
          autoComplete="address-line1"
        />
        <AddressField
          label="Apartment or unit"
          name="unit"
          value={address.unit}
          onChange={onChange}
          error={errors.unit}
          optional
          autoComplete="address-line2"
        />
      </div>

      <div className="address-form-row">
        <AddressField
          label="City"
          name="city"
          value={address.city}
          onChange={onChange}
          error={errors.city}
          autoComplete="address-level2"
        />
        <AddressField
          label="State or province"
          name="state"
          value={address.state}
          onChange={onChange}
          error={errors.state}
          optional
          autoComplete="address-level1"
        />
      </div>

      <div className="address-form-row">
        <AddressField
          label="ZIP or postal code"
          name="zip"
          value={address.zip}
          onChange={onChange}
          error={errors.zip}
          optional
          autoComplete="postal-code"
        />
        <AddressField
          label="Country"
          name="country"
          value={address.country}
          onChange={onChange}
          error={errors.country}
          autoComplete="country-name"
        />
      </div>

      <div className="address-form-row">
        <AddressField
          label="Start month"
          name="startMonth"
          type="month"
          value={address.startMonth}
          onChange={onChange}
          error={errors.startMonth}
        />
        <AddressField
          label="End month"
          name="endMonth"
          type="month"
          value={address.endMonth}
          onChange={onChange}
          error={errors.endMonth}
          min={address.startMonth}
          disabled={address.current}
        />
      </div>

      <div>
        <label className="address-form-choice">
          <input type="checkbox" name="current" checked={address.current} onChange={onChange} />
          <span>I live here now (no end month)</span>
        </label>
        <p className="address-form-hint">
          Dates use month and year. The start and end months both count as covered.
        </p>
      </div>

      <fieldset className="address-form-landlord">
        <legend>
          Landlord <span className="address-form-optional">(optional)</span>
        </legend>
        <div className="address-form-row">
          <AddressField
            label="Name"
            name="landlordName"
            value={address.landlordName}
            onChange={onChange}
            error={errors.landlordName}
          />
          <AddressField
            label="Phone"
            name="landlordPhone"
            type="tel"
            value={address.landlordPhone}
            onChange={onChange}
            error={errors.landlordPhone}
          />
          <AddressField
            label="Email"
            name="landlordEmail"
            type="email"
            value={address.landlordEmail}
            onChange={onChange}
            error={errors.landlordEmail}
          />
        </div>
      </fieldset>

      <AddressField
        label="Notes"
        name="notes"
        type="textarea"
        value={address.notes}
        onChange={onChange}
        error={errors.notes}
        optional
      />

      <div className="address-form-actions">
        <button type="submit" className="address-form-save" disabled={saving}>
          {submitLabel}
        </button>
        <Link to="/addresses" className="address-form-cancel">
          Cancel
        </Link>
      </div>
    </form>
  );
}

AddressForm.propTypes = {
  initialAddress: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  submitLabel: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
};
