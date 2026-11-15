import PropTypes from "prop-types";

// PropTypes shared by the components that receive an activity.
export const contactShape = PropTypes.shape({
  name: PropTypes.string,
  role: PropTypes.string,
  phone: PropTypes.string,
  email: PropTypes.string,
});

export const activityShape = PropTypes.shape({
  _id: PropTypes.string,
  type: PropTypes.oneOf(["work", "school", "other"]).isRequired,
  organization: PropTypes.string,
  title: PropTypes.string.isRequired,
  startMonth: PropTypes.string.isRequired,
  endMonth: PropTypes.string,
  isCurrent: PropTypes.bool,
  contact: contactShape,
  notes: PropTypes.string,
});

// A stretch of the gap-check range covered by the same activities.
// No activityIds means the stretch is a gap.
export const segmentShape = PropTypes.shape({
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  months: PropTypes.number.isRequired,
  activityIds: PropTypes.arrayOf(PropTypes.string).isRequired,
});

export const gapShape = PropTypes.shape({
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  months: PropTypes.number.isRequired,
});
