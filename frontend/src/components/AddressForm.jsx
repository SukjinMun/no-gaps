import { useId, useState } from "react";
import PropTypes from "prop-types";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { Link } from "react-router";
import AddressField from "./AddressField.jsx";
import "./AddressForm.css";

export default function AddressForm({
  initialAddress,
  errors,
  submitLabel,
  onSave,
}) {
  const currentId = useId();
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
    <Form noValidate onSubmit={onSubmit}>
      <Row className="g-3">
        {errorCount > 0 && (
          <Col xs={12}>
            <Alert variant="danger" className="mb-0">
              {errors.form ??
                `Please fix ${errorCount} ${errorCount === 1 ? "field" : "fields"} before saving.`}
            </Alert>
          </Col>
        )}

        <Col md={8}>
          <AddressField
            label="Street address"
            name="street"
            value={address.street}
            onChange={onChange}
            error={errors.street}
            autoComplete="address-line1"
          />
        </Col>
        <Col md={4}>
          <AddressField
            label="Apartment or unit"
            name="unit"
            value={address.unit}
            onChange={onChange}
            error={errors.unit}
            optional
            autoComplete="address-line2"
          />
        </Col>

        <Col md={6}>
          <AddressField
            label="City"
            name="city"
            value={address.city}
            onChange={onChange}
            error={errors.city}
            autoComplete="address-level2"
          />
        </Col>
        <Col md={6}>
          <AddressField
            label="State or province"
            name="state"
            value={address.state}
            onChange={onChange}
            error={errors.state}
            optional
            autoComplete="address-level1"
          />
        </Col>

        <Col md={6}>
          <AddressField
            label="ZIP or postal code"
            name="zip"
            value={address.zip}
            onChange={onChange}
            error={errors.zip}
            optional
            autoComplete="postal-code"
          />
        </Col>
        <Col md={6}>
          <AddressField
            label="Country"
            name="country"
            value={address.country}
            onChange={onChange}
            error={errors.country}
            autoComplete="country-name"
          />
        </Col>

        <Col md={6}>
          <AddressField
            label="Start month"
            name="startMonth"
            type="month"
            value={address.startMonth}
            onChange={onChange}
            error={errors.startMonth}
          />
        </Col>
        <Col md={6}>
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
        </Col>

        <Col xs={12}>
          <Form.Check
            type="checkbox"
            id={currentId}
            name="current"
            label="I live here now (no end month)"
            checked={address.current}
            onChange={onChange}
          />
          <Form.Text>
            Dates use month and year. The start and end months both count as
            covered.
          </Form.Text>
        </Col>

        <Col xs={12}>
          <fieldset className="address-form-landlord">
            <legend>
              Landlord{" "}
              <span className="fw-normal text-body-secondary">(optional)</span>
            </legend>
            <Row className="g-3">
              <Col md={6}>
                <AddressField
                  label="Name"
                  name="landlordName"
                  value={address.landlordName}
                  onChange={onChange}
                  error={errors.landlordName}
                />
              </Col>
              <Col md={6}>
                <AddressField
                  label="Phone"
                  name="landlordPhone"
                  type="tel"
                  value={address.landlordPhone}
                  onChange={onChange}
                  error={errors.landlordPhone}
                />
              </Col>
              <Col md={6}>
                <AddressField
                  label="Email"
                  name="landlordEmail"
                  type="email"
                  value={address.landlordEmail}
                  onChange={onChange}
                  error={errors.landlordEmail}
                />
              </Col>
            </Row>
          </fieldset>
        </Col>

        <Col xs={12}>
          <AddressField
            label="Notes"
            name="notes"
            type="textarea"
            value={address.notes}
            onChange={onChange}
            error={errors.notes}
            optional
          />
        </Col>

        <Col xs={12} className="address-form-actions">
          <Button variant="primary" type="submit" disabled={saving}>
            {submitLabel}
          </Button>
          <Button as={Link} variant="outline-secondary" to="/addresses">
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

AddressForm.propTypes = {
  initialAddress: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  submitLabel: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
};
