import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import ActivityForm from "../components/ActivityForm.jsx";
import ActivityList from "../components/ActivityList.jsx";
import GapSummary from "../components/GapSummary.jsx";
import LifeTimeline from "../components/LifeTimeline.jsx";
import {
  createActivity,
  deleteActivity,
  getActivities,
  getGaps,
  updateActivity,
} from "../api/activitiesApi.js";
import "./ActivitiesPage.css";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [message, setMessage] = useState("");
  // null = form closed; {} = new activity; an activity = editing it.
  const [formActivity, setFormActivity] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const formRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [list, gaps] = await Promise.all([getActivities(), getGaps(10)]);
      setActivities(list);
      setSummary(gaps);
      setStatus("ready");
    } catch (error) {
      setMessage(error.status === 401 ? "Please log in to see your history." : error.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // The highlight fades out by itself.
  useEffect(() => {
    if (!highlightedId) return undefined;
    const timer = setTimeout(() => setHighlightedId(null), 2000);
    return () => clearTimeout(timer);
  }, [highlightedId]);

  useEffect(() => {
    if (formActivity) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [formActivity]);

  async function handleSave(values) {
    if (values._id) {
      await updateActivity(values._id, values);
    } else {
      await createActivity(values);
    }
    setFormActivity(null);
    setMessage("");
    await load();
  }

  async function handleDelete(id) {
    try {
      await deleteActivity(id);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // Scrolls to an activity in the list and highlights it for a moment.
  function handleShowActivity(id) {
    document
      .getElementById(`activity-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(id);
  }

  function handleAddForGap(gap) {
    setFormActivity({ type: "other", startMonth: gap.start, endMonth: gap.end });
  }

  return (
    <main className="activities-page">
      <div className="activities-page__header">
        <div>
          <h1>Jobs &amp; Schools</h1>
          <p>
            Every job, school and explained period, with any missing months in the last 10 years
            flagged.
          </p>
        </div>
        {status === "ready" && (
          <button
            type="button"
            className="activities-page__add"
            onClick={() => setFormActivity({})}
          >
            + Add activity
          </button>
        )}
      </div>

      {status === "ready" && summary && (
        <LifeTimeline
          range={summary.range}
          segments={summary.timeline}
          activities={activities}
          onGapClick={handleAddForGap}
          onActivityClick={handleShowActivity}
        />
      )}

      <details className="activities-page__help">
        <summary>How to use this page</summary>
        <ul>
          <li>
            Add each job or school with its start and end month. Both months count as covered.
          </li>
          <li>Mark something you do now as current; it runs to this month.</li>
          <li>
            Use “Other activity” for months without work or school (for example, caregiving) so they
            count as explained.
          </li>
          <li>Working and studying at the same time is fine and never flagged.</li>
        </ul>
      </details>

      {message && (
        <p role="alert" className="activities-page__message">
          {message}
        </p>
      )}

      {status === "loading" && <p className="activities-page__status">Loading your history…</p>}

      {status === "ready" && (
        <>
          {summary && <GapSummary summary={summary} onAddForGap={handleAddForGap} />}

          {formActivity && (
            <div ref={formRef}>
              <ActivityForm
                key={formActivity._id ?? JSON.stringify(formActivity)}
                initialActivity={formActivity}
                onSave={handleSave}
                onCancel={() => setFormActivity(null)}
              />
            </div>
          )}

          <ActivityList
            activities={activities}
            highlightedId={highlightedId}
            onAdd={() => setFormActivity({})}
            onEdit={setFormActivity}
            onDelete={handleDelete}
          />
        </>
      )}
    </main>
  );
}

// The page takes no props: it loads the signed-in user's activities itself.
ActivitiesPage.propTypes = {};
