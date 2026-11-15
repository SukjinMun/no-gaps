import { useState } from "react";
import PropTypes from "prop-types";
import { activityShape } from "../utils/activityShape.js";
import "./ActivityForm.css";

const EMPTY = {
  type: "work",
  organization: "",
  title: "",
  startMonth: "",
  endMonth: "",
  isCurrent: false,
  contact: { name: "", role: "", phone: "", email: "" },
  notes: "",
};

const LABELS = {
  work: { organization: "Company", title: "Position" },
  school: { organization: "School", title: "Program" },
  other: { organization: "Organization (optional)", title: "Explanation" },
};

function toFormValues(activity) {
  return {
    ...EMPTY,
    ...activity,
    endMonth: activity?.endMonth ?? "",
    contact: { ...EMPTY.contact, ...(activity?.contact ?? {}) },
  };
}

export default function ActivityForm({ initialActivity, onSave, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(initialActivity));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(initialActivity?._id);
  const labels = LABELS[values.type];

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function setContactField(name, value) {
    setValues((current) => ({ ...current, contact: { ...current.contact, [name]: value } }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setFormError("");
    try {
      await onSave({ ...values, endMonth: values.isCurrent ? null : values.endMonth });
    } catch (error) {
      setErrors(error.errors ?? {});
      setFormError(error.message);
      setSaving(false);
    }
  }

  const errorCount = Object.keys(errors).length;

  return (
    <section className="activity-form" aria-labelledby="form-title">
      <h2 id="form-title">{isEditing ? "Edit activity" : "Add activity"}</h2>

      <form className="activity-form__card" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div role="alert" className="activity-form__alert">
            {errorCount > 0
              ? `Please fix ${errorCount} field${errorCount === 1 ? "" : "s"} before saving.`
              : formError}
          </div>
        )}

        <fieldset className="activity-form__types">
          <legend>Type</legend>
          {[
            ["work", "Work"],
            ["school", "School"],
            ["other", "Other activity / explained period"],
          ].map(([value, label]) => (
            <label key={value} className="activity-form__choice">
              <input
                type="radio"
                name="type"
                value={value}
                checked={values.type === value}
                onChange={() => setField("type", value)}
              />
              {label}
            </label>
          ))}
          {errors.type && <span className="activity-form__error">{errors.type}</span>}
        </fieldset>

        <div className="activity-form__row">
          <Field id="organization" label={labels.organization} error={errors.organization}>
            <input
              id="organization"
              type="text"
              value={values.organization}
              onChange={(e) => setField("organization", e.target.value)}
            />
          </Field>
          <Field id="title" label={labels.title} error={errors.title}>
            <input
              id="title"
              type="text"
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder={values.type === "other" ? "For example, family caregiving" : ""}
            />
          </Field>
        </div>

        <div className="activity-form__row">
          <Field id="startMonth" label="Start month" error={errors.startMonth}>
            <input
              id="startMonth"
              type="month"
              placeholder="YYYY-MM"
              value={values.startMonth}
              onChange={(e) => setField("startMonth", e.target.value)}
            />
          </Field>
          <Field id="endMonth" label="End month" error={errors.endMonth}>
            <input
              id="endMonth"
              type="month"
              placeholder="YYYY-MM"
              value={values.isCurrent ? "" : values.endMonth}
              disabled={values.isCurrent}
              onChange={(e) => setField("endMonth", e.target.value)}
            />
          </Field>
        </div>

        <label className="activity-form__choice">
          <input
            type="checkbox"
            checked={values.isCurrent}
            onChange={(e) => setField("isCurrent", e.target.checked)}
          />
          I’m currently doing this (no end month)
        </label>
        <p className="activity-form__hint">
          Dates use month and year. The start and end months both count as covered.
        </p>

        <fieldset className="activity-form__contact">
          <legend>
            Contact <span className="activity-form__optional">(optional)</span>
          </legend>
          <div className="activity-form__row activity-form__row--pairs">
            <Field id="contactName" label="Name">
              <input
                id="contactName"
                type="text"
                value={values.contact.name}
                onChange={(e) => setContactField("name", e.target.value)}
              />
            </Field>
            <Field id="contactRole" label="Role" hint="Supervisor, school office or reference.">
              <input
                id="contactRole"
                type="text"
                value={values.contact.role}
                onChange={(e) => setContactField("role", e.target.value)}
              />
            </Field>
            <Field id="contactPhone" label="Phone">
              <input
                id="contactPhone"
                type="tel"
                value={values.contact.phone}
                onChange={(e) => setContactField("phone", e.target.value)}
              />
            </Field>
            <Field id="contactEmail" label="Email">
              <input
                id="contactEmail"
                type="email"
                placeholder="name@example.com"
                value={values.contact.email}
                onChange={(e) => setContactField("email", e.target.value)}
              />
            </Field>
          </div>
        </fieldset>

        <Field id="notes" label="Notes (optional)">
          <textarea
            id="notes"
            rows={3}
            value={values.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </Field>

        <div className="activity-form__buttons">
          <button type="submit" className="activity-form__save" disabled={saving}>
            {saving ? "Saving…" : "Save activity"}
          </button>
          <button type="button" className="activity-form__cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

ActivityForm.propTypes = {
  initialActivity: PropTypes.oneOfType([activityShape, PropTypes.object]),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

// One labelled field with its hint and error message.
function Field({ id, label, hint, error, children }) {
  return (
    <div className={`activity-form__field${error ? " activity-form__field--invalid" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <span className="activity-form__hint">{hint}</span>}
      {error && (
        <span className="activity-form__error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

Field.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
};
