import { useId } from "react";
import PropTypes from "prop-types";
import Form from "react-bootstrap/Form";
import "./AddressField.css";

export default function AddressField({
  label,
  name,
  value,
  onChange,
  error = "",
  type = "text",
  optional = false,
  autoComplete,
  min,
  disabled = false,
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <>
      <Form.Label className="address-field-label" htmlFor={id}>
        {label}
        {optional && (
          <span className="fw-normal text-body-secondary"> (optional)</span>
        )}
      </Form.Label>
      <Form.Control
        {...(type === "textarea" ? { as: "textarea", rows: 3 } : { type })}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        min={min}
        disabled={disabled}
        isInvalid={Boolean(error)}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p className="address-field-error" id={errorId}>
          {error}
        </p>
      )}
    </>
  );
}

AddressField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  type: PropTypes.string,
  optional: PropTypes.bool,
  autoComplete: PropTypes.string,
  min: PropTypes.string,
  disabled: PropTypes.bool,
};
