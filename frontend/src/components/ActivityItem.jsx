import { useState } from "react";
import PropTypes from "prop-types";
import { activityShape } from "../utils/activityShape.js";
import { formatPeriod } from "../utils/months.js";
import "./ActivityItem.css";

const BADGES = {
  work: "Work",
  school: "School",
  other: "Other · Explained",
};

function contactLine(activity) {
  const { contact = {}, type } = activity;
  if (!contact.name && !contact.phone && !contact.email) return "";
  const label = type === "work" ? "Supervisor" : "Contact";
  const who = [contact.name, contact.role].filter(Boolean).join(", ");
  const reach = [contact.phone, contact.email].filter(Boolean).join(" · ");
  return `${label}: ${[who, reach].filter(Boolean).join(" · ")}`;
}

export default function ActivityItem({ activity, highlighted = false, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const contact = contactLine(activity);
  const badge = BADGES[activity.type] + (activity.isCurrent ? " · Current" : "");

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(activity._id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <li
      id={`activity-${activity._id}`}
      className={`activity-item${highlighted ? " activity-item--highlighted" : ""}`}
    >
      <div className="activity-item__when">
        <strong>{formatPeriod(activity.startMonth, activity.endMonth, activity.isCurrent)}</strong>
        <span className={`activity-item__badge activity-item__badge--${activity.type}`}>
          {badge}
        </span>
      </div>

      <div className="activity-item__body">
        <span className="activity-item__title">{activity.title}</span>
        {activity.organization && (
          <span className="activity-item__muted">{activity.organization}</span>
        )}
        {contact && <span className="activity-item__small">{contact}</span>}
        {activity.notes && <span className="activity-item__small">{activity.notes}</span>}
      </div>

      {confirming ? (
        <div className="activity-item__actions" role="group" aria-label="Confirm delete">
          <span className="activity-item__confirm-text">Delete this activity?</span>
          <button
            type="button"
            className="activity-item__button activity-item__button--danger-solid"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Yes, delete"}
          </button>
          <button
            type="button"
            className="activity-item__button"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="activity-item__actions">
          <button
            type="button"
            className="activity-item__button activity-item__button--primary"
            onClick={() => onEdit(activity)}
            aria-label={`Edit ${activity.title}`}
          >
            Edit
          </button>
          <button
            type="button"
            className="activity-item__button activity-item__button--danger"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${activity.title}`}
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

ActivityItem.propTypes = {
  activity: activityShape.isRequired,
  highlighted: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
