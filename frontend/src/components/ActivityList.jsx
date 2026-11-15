import PropTypes from "prop-types";
import ActivityItem from "./ActivityItem.jsx";
import { activityShape } from "../utils/activityShape.js";
import "./ActivityList.css";

export default function ActivityList({ activities, highlightedId, onAdd, onEdit, onDelete }) {
  if (activities.length === 0) {
    return (
      <section className="activity-list__empty" aria-labelledby="empty-title">
        <h2 id="empty-title">No activities yet</h2>
        <p>
          Add your first job, school or explained period. The gap check updates as soon as you save
          it.
        </p>
        <button type="button" className="activity-list__add" onClick={onAdd}>
          + Add activity
        </button>
      </section>
    );
  }

  return (
    <section className="activity-list" aria-labelledby="list-title">
      <h2 id="list-title" className="activity-list__title">
        Timeline <span className="activity-list__hint">· newest first</span>
      </h2>
      <ol className="activity-list__items">
        {activities.map((activity) => (
          <ActivityItem
            key={activity._id}
            activity={activity}
            highlighted={activity._id === highlightedId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ol>
    </section>
  );
}

ActivityList.propTypes = {
  activities: PropTypes.arrayOf(activityShape).isRequired,
  highlightedId: PropTypes.string,
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
