import { request } from "./client.js";

export function registerUser(username, password) {
  return request("/api/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logIn(username, password) {
  return request("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logOut() {
  return request("/api/logout", { method: "POST" });
}

// Returns { username } or throws an ApiError with status 401.
export function getMe() {
  return request("/api/me");
}
