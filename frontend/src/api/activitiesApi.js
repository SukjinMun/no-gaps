import { request } from "./client.js";

export function getActivities() {
  return request("/api/activities");
}

export function getGaps(years = 10) {
  return request(`/api/activities/gaps?years=${years}`);
}

export function createActivity(activity) {
  return request("/api/activities", { method: "POST", body: JSON.stringify(activity) });
}

export function updateActivity(id, activity) {
  return request(`/api/activities/${id}`, { method: "PUT", body: JSON.stringify(activity) });
}

export function deleteActivity(id) {
  return request(`/api/activities/${id}`, { method: "DELETE" });
}
